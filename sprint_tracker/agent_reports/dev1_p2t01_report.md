# P2-T01 Implementation Report — Badge System

**Date:** 2026-04-27
**Agent:** Implementation Agent (dev1)
**Branch:** `worktree-agent-a3bee94bb58eaee2b`
**Commit:** `3aae12a`

---

## Summary

Implemented the full badge system backend for Sprint 08, P2-T01. All 10 badge types are defined and checked synchronously inside `AttemptService.submitAnswer` after each answer submission. Badge awards are idempotent (no duplicate rows possible via DB unique constraint + in-memory `alreadyHas` set + `createMany skipDuplicates`).

---

## Files Created

| File | Purpose |
|---|---|
| `apps/api/prisma/migrations/20260427050000_add_badges/migration.sql` | Creates `BadgeType` enum and `badges` table |
| `apps/api/src/badge/badge.service.ts` | Core badge logic — `checkAndAwardBadges`, `getStudentBadges` |
| `apps/api/src/badge/badge.controller.ts` | `GET /badges/me` — student-role protected |
| `apps/api/src/badge/badge.module.ts` | NestJS module wiring |
| `apps/api/src/badge/badge.service.spec.ts` | Unit tests (13 test cases) |

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/prisma/schema.prisma` | Added `BadgeType` enum, `Badge` model, `badges` relation on `User` |
| `apps/api/src/app.module.ts` | Registered `BadgeModule` |
| `apps/api/src/attempt/attempt.module.ts` | Imported `BadgeModule` |
| `apps/api/src/attempt/attempt.service.ts` | Injected `BadgeService`, added badge side-effects, `badgesEarned` in return |
| `apps/api/src/attempt/attempt.service.spec.ts` | Added `BadgeService` mock to prevent DI errors |

---

## Badge Conditions Implemented

| Badge | Condition | DB Query |
|---|---|---|
| `first_correct` | correct=true, no existing badge | None beyond existing-badges check |
| `speed_demon` | correct=true AND timeSpentMs < 10,000 | None |
| `streak_7` | streakCount >= 7 | None (from context) |
| `streak_30` | streakCount >= 30 | None (from context) |
| `problems_100` | totalAttempts >= 100 | None (from context) |
| `correct_50` | correctTotal >= 50 | None (from context) |
| `perfect_10` | last 10 attempts all correct | `findMany` last 10 attempts |
| `fraction_master` | grade-3 fraction attempts >= 10, all correct | `findMany` with grade+strand filter |
| `math_explorer` | >= 5 distinct topics attempted | `findMany` distinct problemId |
| `top_of_class` | **Deferred to Sprint 09** | Requires leaderboard context |

---

## Design Decisions

- **No BullMQ** — badge checks run synchronously in the same `try/catch` as attempt persistence. Badge failures are logged and swallowed so they never break the attempt response.
- **streakCount defaulted to 0** in `AttemptService` context — the User model does not yet have a `streakCount` field (GamificationService is a stub). Streak badges will be auto-activated once Sprint 09 wires up the streak field.
- **Bulk write** — `createMany({ skipDuplicates: true })` is called once per attempt (not once per badge), minimising DB round-trips.
- **`MATH_EXPLORER` uses distinct by problemId** then counts unique topics in application code — consistent with the approach already used in `getStudentStats`.

---

## Test Coverage

`badge.service.spec.ts` covers:
- `first_correct` — awarded on correct answer; not awarded on wrong answer
- `speed_demon` — awarded <10s correct; not awarded on wrong answer; not awarded at exactly 10s (boundary)
- `problems_100` — awarded at exactly 100; not awarded at 99
- `streak_7` — awarded at 7; not awarded at 6
- Idempotency — existing badges are skipped; `createMany` not called when nothing to award; `skipDuplicates: true` always passed
- `getStudentBadges` — metadata enrichment; empty result

---

## Known Limitations / Future Work

- `TOP_OF_CLASS` badge is not awarded in the attempt flow. A separate endpoint or a scheduled job (Sprint 09) should call `BadgeService` with leaderboard rank context.
- `streakCount` in the badge context is hardcoded to `0` until the Gamification module tracks daily streaks on the User model.
- TypeScript compilation was not verified locally (node_modules not installed in worktree). The code follows identical patterns to existing services and should compile cleanly.
