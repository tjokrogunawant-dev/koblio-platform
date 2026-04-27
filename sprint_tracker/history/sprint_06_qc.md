# QC Report — Sprint 06 (Section 4: Gamification)

**Date:** 2026-04-27  
**Reviewer:** QC Agent  
**Tasks:** P1-T23, P1-T24, P1-T25, P1-T26, P1-T27 (backend), P1-T28 (frontend)

---

## Overall Verdict

**PASS WITH MINOR FIXES**

The gamification foundation is solid. Both branches deliver working implementations with good test coverage. Three issues require attention before merge: (1) the level-up DB update runs outside the `$transaction` block creating a non-atomic write, (2) `awardForAttempt` does not gracefully degrade if gamification throws (attempt save would still fail at the call site), and (3) the `getDailyChallenge` endpoint returns a raw-JSONB `content` object but the frontend casts the response to the `Problem` interface which expects `questionText` — this will silently produce `undefined` in the Daily Challenge card.

---

## Backend (P1-T23–T27)

### What's correct

- **P1-T23 (coins + XP):** `awardForAttempt` correctly awards 0 coins / +1 XP for wrong answers, and the correct tiered amounts (3/5, 5/10, 10/20) for easy/medium/hard correct answers. The difficulty string is normalized with `.toUpperCase()` before the switch, which handles case-insensitive input. `PointsLedger` entries are only written for correct answers (`coinsEarned > 0`), which is correct.
- **P1-T24 (level info):** `getLevelInfo` is correct. The threshold table, `progressPercent` clamping, and max-level handling (level 10 = 100%) are all accurate.
- **P1-T25 (streak):** `updateStreak` only runs on correct answers — confirmed in `attempt.service.ts` line 75–77 (`if (correct) { await this.gamificationService.updateStreak(studentId); }`). Today/yesterday/gap date comparison logic is correct.
- **P1-T26 (leaderboard):** `getClassLeaderboard` uses Prisma `$queryRaw` with tagged template literals throughout — no string concatenation. The `classroomId` is typed with `::uuid` cast, which is safe. The "student not in top 10" secondary query is also parameterised.
- **P1-T27 (daily challenge):** Deterministic by day (`Math.floor(Date.now() / 86400000) % problems.length`) and returns `null` when no problems exist for a grade.
- **Auth guards:** `JwtAuthGuard` and `RolesGuard` are registered globally via `APP_GUARD` in `app.module.ts`. Per-endpoint security is handled via `@Roles('student')` and `@Public()` decorators rather than repeating `@UseGuards(...)` on each handler — this is the correct NestJS pattern for this app. The `@Public()` decorator on `getStatus` and `getDailyChallenge` correctly bypasses `JwtAuthGuard` (confirmed by looking at the guard's `canActivate` checking `IS_PUBLIC_KEY`). No `@UseGuards(...)` decoration needed — the global guards handle it.
- **Migration SQL:** The five `ALTER TABLE "users" ADD COLUMN` statements exactly match the five new fields in the Prisma schema (`xp`, `level`, `streak_count`, `last_active_date`, `coins`). The `points_ledger` table DDL matches the `PointsLedger` model. The composite index `points_ledger_student_id_created_at_idx` on `(student_id, created_at)` matches the Prisma `@@index([studentId, createdAt])`.
- **Test coverage:** 20+ unit tests across `gamification.service.spec.ts` and `gamification.controller.spec.ts`. All key paths are exercised: level-up detection, streak increment/reset/same-day, daily challenge determinism, correct/wrong answer rewards.

### Issues found

**[BLOCKING] Issue 1 — Level-up DB write is outside the transaction (data inconsistency risk)**

`awardForAttempt` lines 144–156: after the `$transaction` closes, the method re-reads `user.xp` (returned from the transaction) and, if `leveledUp`, calls a second `this.prisma.user.update` to persist the new level. This second update runs **outside** the transaction. If the process crashes or the DB connection drops between the transaction commit and the level update, the user's XP is incremented but their `level` column is never updated — they have levelled-up XP but the old level. Fix: move the `if (leveledUp)` block and the second `user.update` inside the `$transaction` callback.

```
// current (buggy) — level update is AFTER the transaction:
const user = await this.prisma.$transaction(async (tx) => { ... });
const newLevelInfo = this.getLevelInfo(user.xp);
...
if (leveledUp) {
  await this.prisma.user.update(...)  // ← outside tx!
}
```

**[BLOCKING] Issue 2 — `awardForAttempt` exceptions propagate and can swallow the attempt save**

In `attempt.service.ts`, `awardForAttempt` is called **after** the attempt is already saved (line 50). If it throws, the `submitAnswer` method's promise rejects — the HTTP response will be a 500, but the `StudentProblemAttempt` row was committed. On retry, the student will get a new attempt row with fresh gamification, but the original attempt is lost from the gamification ledger. The attempt record itself is not lost (it was committed), but the caller (the browser) sees an error and may show "failed" to the student. Recommendation: wrap the `awardForAttempt` + `updateStreak` calls in a `try/catch` that logs the error but still returns the attempt result. This is consistent with the frontend's own graceful-degradation approach.

**[NON-BLOCKING] Issue 3 — `PointsLedger.attemptId` has no foreign key constraint**

The `PointsLedger` model in the schema has `attemptId String? @map("attempt_id")` with no `@relation` pointing to `StudentProblemAttempt`. The migration also has no FK constraint for `attempt_id`. This means the field is a soft reference — orphan rows are possible if an attempt is deleted. For MVP this is acceptable (no cascaded deletes on attempts currently), but it should be documented as a known gap or a FK added.

---

## Frontend (P1-T28)

### What's correct

- **`'use client'` directives:** All five gamification components (`CoinCounter`, `XPBar`, `StreakBadge`, `LeaderboardWidget`, `DailyChallengeCard`) and both new pages (`student/page.tsx`, `student/leaderboard/page.tsx`) are correctly marked `'use client'`.
- **`SubmitAnswerResponse` updated:** `api.ts` lines 177–185 include `coinsEarned?`, `xpEarned?`, `leveledUp?` as optional fields, correctly matching the backend's response shape.
- **`getStudentProfile` graceful degradation:** `student/page.tsx` lines 34–39 wraps the call in `.catch(() => {})` — a gamification failure does not crash the dashboard. The stats row is conditionally rendered only when `profile` or `loadingProfile` is truthy.
- **Leaderboard `classroomId` absence handling:** `leaderboard/page.tsx` lines 26–27 reads `classroomId` from the user object with a type assertion and guards the fetch with `if (!token || !classroomId) return`. When absent, the page renders a "Join a class" empty state (lines 58–67). This handles the case correctly.
- **COPPA — no email displayed:** Confirmed. Neither `student/page.tsx`, `leaderboard/page.tsx`, nor any of the five gamification components renders `email`. The `AuthUser` interface has an `email` field but it is never used in student-facing UI.
- **`LeaderboardEntry` interface match:** The frontend `LeaderboardEntry` interface (`rank`, `studentId`, `displayName`, `weeklyCoins`) exactly matches the backend's exported `LeaderboardEntry` interface in `gamification.service.ts`.
- **Frontend tests:** `gamification.test.tsx` covers `CoinCounter` (coin amount, emoji, locale formatting) and `StreakBadge` (non-zero streak, zero streak, orange class for ≥7, gray class for <7).

### Issues found

**[BLOCKING] Issue 4 — `getDailyChallenge` response shape mismatch**

The backend `getDailyChallenge` endpoint (in `GamificationService`) returns a problem with raw JSONB in the `content` field:
```ts
{ id, grade, strand, topic, difficulty, type, content: unknown }
```
The frontend `getDailyChallenge` in `api.ts` (line 247) casts the response directly to `Problem`, which expects a flat `questionText: string` field (not `content`). This means `problem.questionText` will be `undefined` at runtime — the `DailyChallengeCard` will render an empty question text and the `handleStartChallenge` navigation still works, but the card body is blank.

The content API (`/content/problems/:id`) goes through `ContentService.findOne` which also returns the raw Prisma `Problem` model (including the `content` JSONB) — so `questionText` is not present there either. However, the frontend's existing `Problem` interface in `api.ts` treats `questionText` as a top-level string, implying the content controller must be transforming/renaming this field (or the seed data puts `questionText` at top level). The issue is specifically that `getDailyChallenge` was typed as returning a `Problem` but the backend returns a different (non-transformed) shape.

Fix options: (a) have the backend `getDailyChallenge` delegate to `ContentService.findOne(id)` to get a consistently-shaped response, or (b) add a `toDailyChallengeProblem` mapper in `GamificationService` that extracts `content.questionText` into a top-level field, or (c) change the frontend type to match the actual backend response.

**[NON-BLOCKING] Issue 5 — `getDailyChallenge` frontend fallback when grade is 0**

In `student/page.tsx` line 28: `const grade = user?.grade ?? 1;` — if `user?.grade` is `0` (falsy), it falls back to grade `1`. A grade-0 student is not a valid case in the current data model (`grade` is nullable for teachers/parents), so the `?? 1` default is reasonable. However, if the user is not a student (no grade set at all), `getDailyChallenge(1)` will be called, potentially fetching Grade 1 content for a teacher account. This could be guarded with a role check. Non-blocking for MVP.

**[NON-BLOCKING] Issue 6 — Frontend tests cover only two of five new components**

`gamification.test.tsx` covers `CoinCounter` and `StreakBadge`. `XPBar`, `LeaderboardWidget`, and `DailyChallengeCard` have no unit tests. The leaderboard page and the problem page reward-display path also lack test coverage. Acceptable for MVP but should be added in Sprint 07.

---

## Cross-cutting Issues

**[BLOCKING] Issue 4 revisited — `getDailyChallenge` response contract not honoured**

As described above, the backend returns `{ id, grade, strand, topic, difficulty, type, content: unknown }` from `GET /gamification/daily-challenge/:grade`, while the frontend treats the response as a `Problem` with `questionText`. This is the most significant cross-cutting contract violation.

**[NON-BLOCKING] — `getDailyChallenge` 404 vs null**

The frontend (`api.ts` line 252) handles `res.status === 404` returning `null`. The backend returns HTTP 200 with a `null` body when no problems exist for a grade (NestJS serialises `null` as a `null` JSON body). The frontend `handleResponse` will try to parse the 200 response as a `Problem` and return `null` (since `JSON.parse("null") === null`). This actually works by accident, but the contract should be made explicit — the backend should either return 404 or the frontend should not check for 404. Either way the current behaviour produces the correct result.

---

## Required fixes before merge

1. **Move level-up `user.update` inside `$transaction` in `GamificationService.awardForAttempt`** — prevents XP/level state divergence on crash. (Issue 1)
2. **Wrap gamification side-effects in a `try/catch` in `AttemptService.submitAnswer`** — prevents a gamification failure from returning a 500 to the student when the attempt itself was recorded successfully. (Issue 2)
3. **Fix `getDailyChallenge` response shape** — either transform to the flat `Problem` shape on the backend, or update the frontend type + `DailyChallengeCard` to handle the `content` JSONB structure. As-is, the Daily Challenge card will silently display an empty question. (Issue 4)

---

## Non-blocking notes

- `PointsLedger.attemptId` is a soft reference (no FK). Document or add FK in a follow-up migration. (Issue 3)
- `getDailyChallenge` 404-vs-null contract is ambiguous but currently works. Tighten in Sprint 07.
- Frontend test coverage should be extended to `XPBar`, `LeaderboardWidget`, `DailyChallengeCard`, and the reward-display paths in the problem page. (Issue 6)
- `getDailyChallenge(grade)` called for non-student roles. Add a role guard in the student dashboard page. (Issue 5)
- The `getDailyChallenge` backend query loads all problems for a grade from DB then picks one by index — at scale this is inefficient. Not a concern for MVP but plan to add `OFFSET`-based selection in Section 8.
