# P5-T03 Implementation Report — Mood Detection Service

**Date:** 2026-04-27
**Task:** P5-T03 — Mood Service (FLOW / FRUSTRATED / CONFUSED / BORED state machine)
**Agent:** dev1

---

## Summary

Implemented the mood-gated state machine module at `apps/api/src/mood/`. The module infers student mood from the last 5 attempt records and returns scheduler weight shifts to be consumed by the blended scheduler (P5-T04).

---

## Files Created

| File | Purpose |
|---|---|
| `apps/api/src/mood/mood.types.ts` | `MoodState` enum and `MoodWeights` interface |
| `apps/api/src/mood/mood.service.ts` | Core detection logic + weight table + `getMoodWeights` |
| `apps/api/src/mood/mood.controller.ts` | `GET /mood/me` endpoint (STUDENT role) |
| `apps/api/src/mood/mood.module.ts` | NestJS module — imports PrismaModule, exports MoodService |
| `apps/api/src/mood/mood.service.spec.ts` | Unit tests covering all state transitions and edge cases |

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/app.module.ts` | Added `MoodModule` import and registration |

---

## State Transition Implementation

The detection window is the last 5 `StudentProblemAttempt` records ordered by `createdAt DESC`. Rules are applied in the following order (most specific first):

```
1. BORED:       accuracy >= 0.8 AND avgTimeMs < 5000
2. FLOW:        accuracy >= 0.7 AND avgTimeMs in [5000, 30000]
3. FRUSTRATED:  accuracy < 0.4 AND avgTimeMs < 10000
4. CONFUSED:    accuracy < 0.4 AND avgTimeMs >= 10000
5. default:     FLOW
```

BORED is checked before FLOW because a student with accuracy=1.0 and avgTimeMs=2000 satisfies both rules — BORED is more specific.

---

## Weight Table

| Mood | fsrsWeight | bktWeight | noveltyWeight | difficultyOffset |
|---|---|---|---|---|
| FLOW | 0.5 | 0.3 | 0.2 | 0 |
| FRUSTRATED | 0.3 | 0.5 | 0.2 | -1 |
| CONFUSED | 0.2 | 0.6 | 0.2 | -2 |
| BORED | 0.4 | 0.2 | 0.4 | +1 |

---

## Test Coverage

All 6 required test cases implemented in `mood.service.spec.ts`:

1. All-correct fast answers → BORED
2. All-wrong slow answers → CONFUSED
3. All-wrong fast answers → FRUSTRATED
4. Good accuracy normal pace → FLOW
5. Empty attempt history → FLOW (default)
6. Boundary case (accuracy=0.7, avgTime=5000) → FLOW

Plus `getWeights` coverage for all 4 states and `getMoodWeights` integration.

---

## API Endpoint

```
GET /mood/me
Authorization: Bearer <jwt>
Role: STUDENT

Response 200:
{
  "mood": "FRUSTRATED",
  "weights": {
    "fsrsWeight": 0.3,
    "bktWeight": 0.5,
    "noveltyWeight": 0.2,
    "difficultyOffset": -1
  }
}
```

---

## Notes for P5-T04

`MoodService` is exported from `MoodModule`. The blended scheduler should import `MoodModule` and inject `MoodService`, then call `getMoodWeights(studentId)` to retrieve the live weight shifts before scoring candidate problems.
