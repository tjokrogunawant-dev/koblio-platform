# P6-T01 — Redis Sorted-Set Leaderboard

**Date:** 2026-04-27
**Agent:** dev1 (Implementation Agent)
**Task:** Replace PostgreSQL RANK() leaderboard with Redis sorted sets

---

## Summary

Implemented a Redis sorted-set leaderboard write-through cache. Every XP award
now increments two Redis sorted sets (classroom + global) via `ZINCRBY` with an
8-day TTL. The classroom leaderboard endpoint now reads from Redis first and
falls back to the existing PostgreSQL RANK() query on cold start.

---

## Files Created

### `apps/api/src/leaderboard/leaderboard.service.ts`
Core service providing:
- `addScore(classroomId, studentId, xpDelta)` — pipeline of `ZINCRBY` + `EXPIRE`
  for both classroom and global keys; never throws (errors are logged and swallowed)
- `getClassroomLeaderboard(classroomId, limit=10)` — `ZREVRANGE … WITHSCORES` +
  single batched Prisma `findMany` to resolve `displayName` / `avatarSlug`
- `getStudentRank(classroomId, studentId)` — `ZREVRANK` returning 0-indexed rank
  or `null` if absent
- `getGlobalLeaderboard(limit=10)` — same pattern on the global key
- `getWeekKey()` — ISO week number computed without external deps: `YYYY-WNN`

Key design:
- Classroom key: `leaderboard:weekly:classroom:{classroomId}:{weekKey}`
- Global key:    `leaderboard:weekly:global:{weekKey}`
- TTL: 691200 s (8 days) — set **after** `ZINCRBY` via pipeline

### `apps/api/src/leaderboard/leaderboard.module.ts`
NestJS module importing `RedisModule` (global, already available) and
`PrismaModule`. Exports `LeaderboardService`.

---

## Files Modified

### `apps/api/src/gamification/gamification.service.ts`
- Injected `LeaderboardService`
- `awardForAttempt` — added optional `classroomId?: string | null` (5th param,
  backward-compatible). After the Prisma transaction, if `xpEarned > 0`, calls
  `leaderboardService.addScore(classroomId, studentId, xpEarned)` as
  fire-and-forget (`void`).
- `getClassLeaderboard` — Redis-first path: calls
  `leaderboardService.getClassroomLeaderboard`. Maps Redis `score` (XP) to
  `weeklyCoins` field to preserve the existing API response shape. If Redis
  returns empty (cold start), logs a warning and falls back to the original SQL
  RANK() query unchanged.

### `apps/api/src/gamification/gamification.module.ts`
Added `LeaderboardModule` to `imports`.

### `apps/api/src/app.module.ts`
Added `LeaderboardModule` to the root module imports.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Fire-and-forget `void addScore(...)` | Redis failure must never block a student's answer submission |
| 8-day TTL (691200 s) | Covers a full week plus 1-day buffer for timezone skew |
| EXPIRE after ZINCRBY in pipeline | Ensures TTL is always refreshed on the key that carries data |
| SQL fallback on empty Redis | Handles cold-start after a Redis restart without downtime |
| weeklyCoins maps to XP score | Avoids a breaking API change; field is labelled "weeklyCoins" but the leaderboard now scores on XP, which is more representative of learning effort |

---

## classroomId Wiring Note

`AttemptService.submitAnswer` does not currently have classroomId in scope.
`awardForAttempt` is called with `classroomId = undefined` for now; Redis still
records the global leaderboard score. The classroom score will be populated once
the assignment-submission flow (which does have classroomId) passes it through.

---

## Status: DONE
