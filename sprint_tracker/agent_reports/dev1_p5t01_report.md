# P5-T01 — FSRS-4.5 Scheduler Service

**Date:** 2026-04-27
**Agent:** dev1
**Task:** Implement FSRS-4.5 spaced repetition scheduler

---

## Summary

Implemented the full FSRS-4.5 scheduler pipeline: Prisma model, pure computation service, DB-backed scheduler service, adaptive problem endpoint, and review recording wired into `AttemptService`.

---

## Files Created

### `apps/api/prisma/migrations/20260427090000_add_card_states/migration.sql`
Raw SQL migration creating the `card_states` table with UUID PK, `(student_id, problem_id)` unique constraint, and `(student_id, due_date)` composite index.

### `apps/api/src/scheduler/fsrs.service.ts`
Pure computation service (no DB) implementing exact FSRS-4.5 formulas:
- `getInitialState(rating)` → `{stability, difficulty}` using S₀ constants (2.5 / 5.0 / 10.0 / 20.0)
- `computeRetrievability(S, t)` → R = e^(-t / 9S)
- `computeNextState(card, rating, R)` → stability update via `S * exp(0.9*(11-D)*(R^0.5-1)+penalty)` for correct, `S * exp(-0.3*R)` for failed; difficulty clamped to [1.0, 10.0]; interval = newS * 0.9

### `apps/api/src/scheduler/scheduler.service.ts`
DB-backed scheduler:
- `getDueCards(studentId, limit)` — returns card states where `dueDate <= now()`, ordered by `dueDate ASC`, includes embedded `problem`
- `getNewCards(studentId, grade, topic, limit)` — problems not yet in any `CardState` for this student
- `recordReview(studentId, problemId, rating)` — upserts `CardState` using FSRS initial state for first review, full FSRS update for subsequent reviews
- `getNextProblem(studentId, grade, topic)` — due cards first, then new cards; returns `Problem | null`

### `apps/api/src/scheduler/scheduler.module.ts`
NestJS module importing `PrismaModule`, exporting both `FsrsService` and `SchedulerService`.

### `apps/api/src/scheduler/fsrs.service.spec.ts`
Unit tests covering:
- Initial stability for all 4 ratings
- Retrievability: boundary at t=0, monotone decrease
- Stability increases after Good/Easy, decreases after Again/Hard
- Easy yields more stability than Good
- Stability floor at 0.1 (minimum guard)
- Difficulty clamping to [1.0, 10.0]
- `nextReviewDays` always positive, equals `newStability * 0.9`

### `apps/api/src/content/dto/adaptive-problem.dto.ts`
Request DTO for `POST /content/problems/adaptive`: `{ studentId: UUID, grade: 1-6, topic: string }`.

---

## Files Modified

### `apps/api/prisma/schema.prisma`
- Added `CardState` model (id, studentId, problemId, stability, difficulty, dueDate, lastReview, reviewCount, timestamps)
- Added `cardStates CardState[]` relation on `User`
- Added `cardStates CardState[]` relation on `Problem`

### `apps/api/src/content/content.service.ts`
- Injected `SchedulerService`
- Added `getNextAdaptiveProblem(studentId, grade, topic)` calling `schedulerService.getNextProblem()` and mapping result with `mapProblem()`

### `apps/api/src/content/content.controller.ts`
- Added `POST /content/problems/adaptive` endpoint requiring `STUDENT` role
- Returns `{ problem: ProblemDto | null }`

### `apps/api/src/content/content.module.ts`
- Added `SchedulerModule` to imports

### `apps/api/src/attempt/attempt.service.ts`
- Injected `SchedulerService`
- After saving the attempt, calls `schedulerService.recordReview(studentId, problemId, rating)` in a try/catch (rating = 3 for correct, 1 for incorrect)

### `apps/api/src/attempt/attempt.module.ts`
- Added `SchedulerModule` to imports (linter applied this automatically)

### `apps/api/src/app.module.ts`
- Added `SchedulerModule` to top-level imports

---

## FSRS Formula Accuracy

| Formula | Implementation |
|---|---|
| S₀(rating) | Constants: 2.5 / 5.0 / 10.0 / 20.0 |
| R = e^(-t/9S) | `Math.exp(-daysSinceLastReview / (9 * stability))` |
| S' correct | `S * exp(0.9 * (11-D) * (R^0.5 - 1) + penalty)` where penalty ∈ {0, -0.15} |
| S' failed | `S * exp(-0.3 * R)` |
| D' | `clamp(D + (rating-3) * 0.1, 1.0, 10.0)` |
| I (90% target) | `S * 0.9` (derived from R_target = 0.9 = e^(-I/9S)) |

---

## Notes

- The `SchedulerModule` is also exported and imported by `ContentModule` and `AttemptModule`; `app.module.ts` imports it explicitly as well (NestJS deduplicates)
- The `SkillMastery` model was added to the schema by the concurrent mastery agent (BKT task); the `CardState` model coexists cleanly
- `recordReview` is wrapped in try/catch in `AttemptService` — scheduler failure never blocks the attempt response
