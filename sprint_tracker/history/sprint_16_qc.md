# Sprint 16 QC Report

**Date:** 2026-04-27  
**Reviewer:** QC Agent  
**Sprint Goal:** Mood detection state machine + blended adaptive scheduler

## Overall Status: PASS WITH MINOR ISSUES

Both tasks are functionally correct and integrate cleanly. One non-blocking deviation was found in P5-T03: the `detectMood` implementation includes an extra explicit FLOW branch that is not in the spec, and the unit tests do not verify the `detectMood` state machine covers all 4 states as direct transitions (the explicit FLOW path has a boundary test but targets the rule added beyond the spec). No blockers.

---

## P5-T03 Mood Detection

| Criterion | Status | Notes |
|---|---|---|
| `MoodState` enum has all 4 values: FLOW, FRUSTRATED, CONFUSED, BORED | PASS | All 4 present in `mood.types.ts` |
| `MoodWeights` interface has: fsrsWeight, bktWeight, noveltyWeight, difficultyOffset | PASS | All 4 fields present |
| `detectMood` queries last 5 attempts (orderBy createdAt DESC, take 5) | PASS | `orderBy: { createdAt: 'desc' }, take: WINDOW_SIZE (5)` |
| BORED condition checked before FLOW | PASS | BORED branch is first in the if-chain |
| Empty history (0 attempts) → FLOW | PASS | Early return for `attempts.length === 0` |
| BORED: accuracy >= 0.8 AND avgTimeMs < 5000 | PASS | Matches spec exactly |
| FRUSTRATED: accuracy < 0.4 AND avgTimeMs < 10000 | PASS | Matches spec exactly |
| CONFUSED: accuracy < 0.4 AND avgTimeMs >= 10000 | PASS | Matches spec exactly |
| FLOW: default (everything else) | PASS WITH NOTE | See non-blocking issue #1 |
| Weight FLOW: {0.5, 0.3, 0.2, offset:0} | PASS | Matches spec |
| Weight FRUSTRATED: {0.3, 0.5, 0.2, offset:-1} | PASS | Matches spec |
| Weight CONFUSED: {0.2, 0.6, 0.2, offset:-2} | PASS | Matches spec |
| Weight BORED: {0.4, 0.2, 0.4, offset:+1} | PASS | Matches spec |
| `GET /mood/me` guarded with STUDENT role | PASS | `@Roles(UserRole.STUDENT)` decorator present; global JwtAuthGuard + RolesGuard enforce it |
| `MoodService` exported from `MoodModule` | PASS | `exports: [MoodService]` |
| Unit tests cover all 4 state transitions + empty history | PASS WITH NOTE | See non-blocking issue #2 |

---

## P5-T04 Blended Scheduler

| Criterion | Status | Notes |
|---|---|---|
| `getNextProblemBlended` exists in `scheduler.service.ts` | PASS | Method present at line 192 |
| Calls `moodService.getMoodWeights(studentId)` with FLOW fallback if unavailable | PASS | `@Optional()` injection + try/catch fallback to `DEFAULT_FLOW_WEIGHTS` |
| Difficulty filter offset <= -2 → EASY only | PASS | `getDifficultyFilter` returns `['EASY']` |
| Difficulty filter offset == -1 → EASY + MEDIUM | PASS | Returns `['EASY', 'MEDIUM']` |
| Difficulty filter offset == 0 → no filter | PASS | Returns `null` |
| Difficulty filter offset >= 1 → MEDIUM + HARD | PASS | Returns `['MEDIUM', 'HARD']` |
| If no candidates found with filter, relaxes to no filter | PASS | Retries with `null` filter when `candidates.length === 0` |
| Batch fetches CardState and SkillMastery (2 queries, not N) | PASS | `Promise.all([cardState.findMany(...), skillMastery.findMany(...)])` |
| Score formula: `fsrsWeight×fsrsUrgency + bktWeight×bktNovelty + noveltyWeight×noveltyBonus` | PASS | Formula at line 284–287 matches spec |
| noveltyBonus = 1.0 for unseen problems (no CardState), 0.0 for seen | PASS | `cardState === null ? 1.0 : 0.0` |
| `content.service.ts` calls `getNextProblemBlended` (not old `getNextProblem`) | PASS | `getNextAdaptiveProblem` wraps `schedulerService.getNextProblemBlended(...)` |
| `SchedulerModule` imports `MoodModule` and `MasteryModule` | PASS | Both present in `scheduler.module.ts` imports |

---

## Blockers

None.

---

## Non-Blocking Issues

### Issue 1 — Extra explicit FLOW branch in `detectMood` (not in spec)

**File:** `apps/api/src/mood/mood.service.ts` lines 71–73

The implementation inserts an explicit FLOW rule between the BORED check and the FRUSTRATED check:

```typescript
if (accuracy >= 0.7 && avgTimeMs >= 5000 && avgTimeMs <= 30000) {
  return MoodState.FLOW;
}
```

This rule is not present in the acceptance criteria. The spec defines only 3 explicit states (BORED, FRUSTRATED, CONFUSED) and FLOW as the catch-all default. The extra branch has no negative effect on the other transitions (BORED is still first; FRUSTRATED and CONFUSED still fire correctly for their ranges), but it short-circuits cases that would otherwise fall to the default — for example, accuracy = 0.75 with avgTimeMs = 35000 (>30000) would reach the default FLOW correctly either way, but accuracy = 0.75 with avgTimeMs = 6000 hits the explicit branch rather than the default. Functionally the outcome is the same (FLOW), but the implementation diverges from the specified state machine.

**Recommendation:** Remove the explicit FLOW branch and rely solely on the default return at the end of the method. This tightens the state machine to the spec and makes future rules easier to add.

### Issue 2 — `detectMood` unit tests missing one direct state-transition case

**File:** `apps/api/src/mood/mood.service.spec.ts`

The `detectMood` describe block has 6 tests, but only 3 directly exercise spec-defined states (BORED, CONFUSED, FRUSTRATED). The two FLOW cases test (a) "good accuracy + normal pace" via the extra explicit FLOW branch and (b) the empty-history early-return. Neither test exercises the default fall-through path (accuracy 0.4–0.8, outside the explicit FLOW window) which is the canonical FLOW state per spec.

This gap becomes important if the extra explicit branch (Issue 1) is removed — the existing FLOW tests will continue to pass, but the default-FLOW path would be untested.

**Recommendation:** Add a test case for the pure-default FLOW path, e.g., accuracy = 0.6 (between 0.4 and 0.8) at avgTimeMs = 40000 (outside the fast/slow thresholds), which should return FLOW by falling through all conditions.

### Issue 3 — `getNextProblem` (legacy) still present alongside `getNextProblemBlended`

**File:** `apps/api/src/scheduler/scheduler.service.ts` lines 159–177

The old `getNextProblem` method was not removed. It is no longer called from `content.service.ts`, so there is no functional regression. However, leaving dead code risks future callers inadvertently using the non-adaptive path.

**Recommendation:** Either remove `getNextProblem` or add a `@deprecated` JSDoc tag to discourage use. Not urgent, but should be cleaned up before the Section 8 adaptive engine work begins.
