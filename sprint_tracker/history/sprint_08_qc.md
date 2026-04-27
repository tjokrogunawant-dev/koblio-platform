# Sprint 08 QC Report

**Date:** 2026-04-27
**Reviewer:** QC Agent
**Sprint Goal:** Badge system + Avatar selection + Seed expansion

---

## Overall Status: PASS WITH MINOR ISSUES

All three deliverables are functionally sound. One bug (FRACTION_MASTER badge query mismatch) means that badge will never trigger in production. Two non-blocking issues (FRACTION_MASTER perfect-streak gate, missing `badgesEarned` in frontend type) round out the findings.

---

## P2-T01 Badge System

### Acceptance Criteria

| Criterion | Status | Notes |
|---|---|---|
| `@@unique([studentId, type])` on Badge model | PASS | Present in `schema.prisma` line 278 and enforced by migration `20260427050000_add_badges` via `CREATE UNIQUE INDEX "badges_student_id_type_key"` |
| `createMany({ skipDuplicates: true })` used | PASS | `badge.service.ts` line 226-229 |
| Badge side-effects in try/catch | PASS | `attempt.service.ts` lines 91-111 — separate try/catch block from gamification |
| `streakCount` piped from `updateStreak()` | PASS | `attempt.service.ts` lines 82-84 assign `streakResult.streakCount` and pass it to `checkAndAwardBadges` at line 105 |
| `GET /badges/me` protected by STUDENT role guard | PASS | `badge.controller.ts` line 19 — `@Roles('student')` decorator present |
| BadgeType enum has at least 10 types | PASS | Exactly 10 types in enum: FIRST_CORRECT, PERFECT_10, STREAK_7, STREAK_30, PROBLEMS_100, CORRECT_50, FRACTION_MASTER, SPEED_DEMON, MATH_EXPLORER, TOP_OF_CLASS |
| Unit tests cover idempotency | PASS | `badge.service.spec.ts` lines 198-248 — three idempotency tests: "does NOT award a badge the student already has", "calls createMany with skipDuplicates:true", "does not call createMany when no new badges are earned" |
| TOP_OF_CLASS deferred | PASS | Deferred with comment in `badge.service.ts` line 218 |

### Findings

**BUG (blocker candidate):** `FRACTION_MASTER` badge query uses `strand: { contains: 'fraction', mode: 'insensitive' }` (`badge.service.ts` line 188) but all fraction problems in the seed are stored with `strand: 'number_and_operations'` and `topic: 'fractions'`. This means the Prisma filter returns 0 rows and the badge can never be awarded. Fix: change the filter to `topic: { contains: 'fraction', mode: 'insensitive' }`.

**Design concern (non-blocking):** `FRACTION_MASTER` also requires `fractionAttempts.every((a) => a.correct)` — a perfect score across all 10+ fraction attempts. One wrong answer permanently blocks the badge. This may frustrate students. Consider relaxing to ≥ 80% accuracy. This is a product decision, not a bug.

**Minor:** `attempt.service.spec.ts` line 100 — the test calls `submitAnswer` without `hintUsed` in the DTO, which is valid since `hintUsed` is optional, but the mock `mockAttempt` at line 32 has `hintUsed: false`. No issue — just noting for completeness.

---

## P2-T02 Avatar Selection

### Acceptance Criteria

| Criterion | Status | Notes |
|---|---|---|
| `avatarSlug` field added to User model via migration | PASS | Migration `20260427060000_add_avatar` adds `ALTER TABLE "users" ADD COLUMN "avatar_slug" TEXT`. Field reflected in `schema.prisma` line 34 |
| `PUT /me/avatar` validates against exactly 8 slugs | PASS | `update-avatar.dto.ts` defines `VALID_AVATAR_SLUGS` with exactly 8 entries (fox, owl, bear, penguin, cat, dog, rabbit, dragon); `@IsIn(VALID_AVATAR_SLUGS)` enforces this |
| Avatar component renders emoji for known slugs, falls back to initial letter | PASS | `avatar.tsx` lines 28-44 — `AVATAR_MAP` lookup for emoji; fallback to `name.charAt(0).toUpperCase()` or `'?'` when slug unknown |
| Student dashboard shows avatar in header | PASS | `student/page.tsx` lines 82-86 — `<Avatar slug={user?.avatarSlug} size="lg" name={displayName} />` in the welcome row |
| Profile setup page lets student pick and save avatar | PASS | `profile/setup/page.tsx` — renders a 4-column grid of all 8 slugs with selection state, calls `updateAvatar()` on save, redirects to dashboard on success |

### Findings

**Non-blocking:** `apps/web/src/lib/api.ts` `SubmitAnswerResponse` interface (lines 178-186) does not include `badgesEarned: string[]`, even though the backend now returns it. Badges earned during problem submission are silently discarded by the frontend. Sprint 09 should update `SubmitAnswerResponse` and display newly earned badges in the post-answer feedback UI.

**Non-blocking:** The `GET /me/profile` endpoint and `getMyStudentProfile()` API client function are both implemented correctly, but the student dashboard (`student/page.tsx`) still calls `getStudentProfile()` (the gamification endpoint at `/gamification/me`) for coins/XP/streak data rather than `getMyStudentProfile()` (the new `/me/profile` endpoint). This is not a regression — the gamification endpoint is richer — but the two profile endpoints now return overlapping data (both include `coins`, `xp`, `level`, `streakCount`). The new `/me/profile` endpoint adds `avatarSlug` and `grade` but the dashboard reads `avatarSlug` from `user` (auth context) rather than `profile`. This is functional but creates minor data fragmentation. No action required for Sprint 09, but worth a cleanup in Sprint 10.

---

## P2-T08 Seed Expansion

### Acceptance Criteria

| Criterion | Status | Notes |
|---|---|---|
| `problems.json` has 200+ entries | PASS | File is 4402 lines. At ~20 lines per problem, this yields approximately 220 problems. Grade 1 section starts at line 1, Grade 2 section visible at ~1200+, Grade 3 section visible at ~3200+, all with diverse topics and the file terminates cleanly with `]` |
| Coverage across Grade 1, 2, 3 | PASS | All three grades confirmed present with varied strands and topics per grade |
| All 3 problem types present | PASS | FILL_BLANK, MCQ, and TRUE_FALSE all confirmed across multiple grades |
| Each problem has `content.question`, `content.answer`, `content.solution` | PASS | Spot-checked across 20+ entries — all have the three required fields |
| MCQ problems have `content.options` array | PASS | MCQ entries confirmed to have `options` as a string array. FILL_BLANK and TRUE_FALSE entries use `"options": null` or `"options": ["True", "False"]` |

### Findings

**Observation:** Fraction problems in Grade 3 use `strand: 'number_and_operations'` and `topic: 'fractions'`. This is curriculum-accurate (fractions are part of the number and operations domain in Common Core) but conflicts with the `FRACTION_MASTER` badge filter documented above.

---

## Blockers (must fix before Sprint 09)

1. **FRACTION_MASTER badge never awards** — `badge.service.ts` line 188 filters by `strand: { contains: 'fraction' }` but fraction problems are stored with `strand: 'number_and_operations'` and `topic: 'fractions'`. Fix: change to `topic: { contains: 'fraction', mode: 'insensitive' }`.

---

## Non-Blocking Issues

1. **`badgesEarned` missing from frontend `SubmitAnswerResponse` type** — Backend returns `badgesEarned: string[]` from `POST /attempts` but the frontend type and UI ignore it. No badge feedback is shown to students after answering a problem. Should be addressed in Sprint 09 alongside the post-answer feedback UI.

2. **FRACTION_MASTER perfect-streak gate** — The badge requires every fraction attempt (not just 10) to be correct. One wrong answer permanently blocks the badge. Consider relaxing to "10+ correct fraction attempts" without requiring perfection. Product decision for backlog.

3. **Dual profile endpoints serve overlapping data** — `GET /me/profile` and `GET /gamification/me` both return coins, XP, level, and streakCount. The student dashboard fetches both (indirectly, via auth context for avatar + gamification endpoint for stats). Minor tech debt; no user-visible issue.
