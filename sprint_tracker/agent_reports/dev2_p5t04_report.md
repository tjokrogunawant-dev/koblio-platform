# P5-T04 — Blended Scheduler Report

**Date:** 2026-04-27
**Agent:** dev2
**Task:** P5-T04 — Implement `getNextProblemBlended` (Strategy C+D)

---

## Summary

Implemented the blended adaptive scheduler that combines FSRS urgency, BKT novelty, and a novelty bonus, all gated by mood-derived weights. Updated ContentService to route `getNextAdaptiveProblem` through the new blended method.

---

## Files Changed

### `apps/api/src/scheduler/scheduler.service.ts`

- Added `@Optional() moodService: MoodService | null` to the constructor so the module compiles safely even if MoodModule is not yet wired (falls back to FLOW defaults).
- Added `getNextProblemBlended(studentId, grade, topic): Promise<Problem | null>` implementing Strategy C+D:
  1. Calls `moodService.getMoodWeights(studentId)` — falls back to `DEFAULT_FLOW_WEIGHTS` on error or if MoodService is absent.
  2. Converts `difficultyOffset` to a difficulty allowlist via private `getDifficultyFilter()`:
     - offset <= -2 → `['EASY']`
     - offset == -1 → `['EASY', 'MEDIUM']`
     - offset >= 1 → `['MEDIUM', 'HARD']`
     - offset == 0 → no filter
  3. Queries up to 50 candidate problems for the given grade+topic with the difficulty filter. Relaxes to no filter if zero candidates are returned.
  4. Batch-fetches `CardState` and `SkillMastery` rows for all candidates in two parallel queries (avoids N+1).
  5. Scores each candidate:
     - `fsrsUrgency = max(0, daysSinceDue / max(stability, 1))` — 0 for unseen problems
     - `bktNovelty = 1.0 - masteryProb` — uses BKT prior (0.1) if no mastery record
     - `novelty = 1.0 if no CardState else 0.0`
     - `score = fsrsWeight * fsrsUrgency + bktWeight * bktNovelty + noveltyWeight * novelty`
  6. Returns the problem with the highest score.
- Added private helpers `getDifficultyFilter()` and `queryCandidates()`.
- Added constants `DEFAULT_FLOW_WEIGHTS` and `BKT_PRIOR`.

### `apps/api/src/scheduler/scheduler.module.ts`

- Added imports for `MoodModule` and `MasteryModule` so that `MoodService` is available for injection into `SchedulerService`.

### `apps/api/src/content/content.service.ts`

- Updated `getNextAdaptiveProblem` to call `schedulerService.getNextProblemBlended()` instead of the old `getNextProblem()`.
- Updated the JSDoc comment to reflect the blended Strategy C+D algorithm.

---

## Design Decisions

- **`@Optional()` on MoodService**: Keeps the scheduler decoupled — if MoodModule were not imported, the service degrades gracefully to FLOW defaults rather than crashing at startup.
- **Batch DB queries**: Two `findMany` calls instead of per-candidate queries. For 50 candidates this is 2 DB round trips total.
- **Skill mastery fetch scope**: Fetches all skill masteries for the student (not just the current topic) to keep the query simple and allow future multi-topic scoring with zero code changes.
- **Old `getNextProblem` preserved**: Left intact so any other callers (tests, assignment service, etc.) continue to work without modification.
- **Difficulty filter relaxation**: If a mood filter yields zero candidates (e.g., no EASY problems seeded yet), the scheduler falls back to the full pool so the student is never left with nothing to do.

---

## Acceptance Criteria Status

- [x] `getNextProblemBlended` implemented with all three scoring signals
- [x] Mood weights sourced from `MoodService.getMoodWeights`
- [x] Difficulty filter applied based on `difficultyOffset`
- [x] Filter relaxed to no-filter when candidates are empty
- [x] Batch DB lookups — no N+1 queries
- [x] `ContentService.getNextAdaptiveProblem` updated to use blended method
- [x] `SchedulerModule` imports `MoodModule` + `MasteryModule`
- [x] Graceful fallback to FLOW defaults when MoodService unavailable
