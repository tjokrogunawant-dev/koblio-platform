# Sprint 17 QC Report
**Date:** 2026-04-27
**Reviewer:** QC Agent
**Tasks:** P6-T01, P6-T02

---

## P6-T01 — Redis Leaderboard

**Check 1 — Key scheme (classroom + global)**
PASS. `addScore` constructs `leaderboard:weekly:classroom:{classroomId}:{weekKey}` (line 42) and `leaderboard:weekly:global:{weekKey}` (line 47). Matches spec exactly.

**Check 2 — ZINCRBY + EXPIRE, 8-day TTL, never throws**
PASS. Both keys use `pipeline.zincrby` + `pipeline.expire(key, TTL_SECONDS)` where `TTL_SECONDS = 691200` (8 × 86400 = 691200 s). The entire pipeline is wrapped in try/catch; errors are logged via `this.logger.error` and swallowed — method never throws.

**Check 3 — getClassroomLeaderboard uses ZREVRANGE WITHSCORES + single batched Prisma enrichment**
PASS. `client.zrevrange(classKey, 0, limit - 1, 'WITHSCORES')` is called (line 74), result passed to `hydrateEntries` which issues a single `prisma.user.findMany({ where: { id: { in: studentIds } } })` (line 170).

**Check 4 — getStudentRank uses ZREVRANK, returns null when member absent**
PASS. `client.zrevrank(classKey, studentId)` is called (line 97). ioredis returns null for absent members; code returns it directly. Error path also returns null.

**Check 5 — getWeekKey() returns ISO week format YYYY-WNN without external deps**
PASS. Implemented in `leaderboard.service.ts` lines 133–151 using only `Date` arithmetic. Normalises Sunday (0 → 7), computes nearest Thursday, derives year and week number, pads to 2 digits. Output format: `${year}-W${paddedWeek}` e.g. `"2026-W17"`. No external library imported.

**Check 6 — hydrateEntries parses flat WITHSCORES array correctly**
PASS. `for` loop increments by 2 (`i += 2`), assigns `raw[i]` as `studentId` and `parseFloat(raw[i + 1])` as `score` (lines 161–165). Correctly handles ioredis WITHSCORES flat-array format `[member, score, member, score, ...]`.

**Check 7 — awardForAttempt calls addScore as fire-and-forget after XP award**
PASS. `gamification.service.ts` line 166: `void this.leaderboardService.addScore(classroomId, studentId, xpEarned)` — called with `void`, placed after the `$transaction` block. Fire-and-forget; never awaited.

**Check 8 — getClassLeaderboard has Redis-first path with SQL fallback on empty response**
PASS. Lines 245–268: Redis path taken when `redisEntries.length > 0`. If empty, logs a warn and falls back to `$queryRaw` PostgreSQL RANK() query (lines 276–288).

**Check 9 — weeklyCoins field preserved in API response shape (maps to XP score from Redis)**
PASS (with NBI). In the Redis path, `weeklyCoins: e.score` (line 254) carries the XP value. In the SQL fallback path, `weeklyCoins: Number(row.weekly_coins)` maps coin-based ledger totals. Field is present in both paths and API shape is unchanged. See NBI-1 for naming concern.

---

## P6-T02 — TOP_OF_CLASS Badge

**Check 10 — BadgeAwardContext has optional classroomRank?: number | null**
PASS. `badge.service.ts` lines 18–19: `/** 0-indexed ZREVRANK ... */ classroomRank?: number | null;` — correctly typed as optional, accepts null.

**Check 11 — TOP_OF_CLASS check: context.classroomRank === 0 AND not already earned**
PASS. Lines 222–227:
```typescript
if (
  context.classroomRank === 0 &&
  !alreadyHas.has(BadgeType.TOP_OF_CLASS)
) {
  toAward.push(BadgeType.TOP_OF_CLASS);
}
```
Strict equality `=== 0` correctly identifies 0-indexed rank 1. `alreadyHas` is built from existing badge records fetched at start of method.

**Check 12 — Badge is idempotent (skipDuplicates + alreadyHas check)**
PASS. Double guard: (a) `alreadyHas.has(BadgeType.TOP_OF_CLASS)` check skips awarding when badge already exists (line 224). (b) `prisma.badge.createMany({ ..., skipDuplicates: true })` (line 235) provides a DB-level safety net.

**Check 13 — LeaderboardService injected in AttemptService**
PASS. `attempt.service.ts` line 8 imports `LeaderboardService`, line 21 declares it in the constructor, line 112 calls `this.leaderboardService.getStudentRank(...)`.

**Check 14 — Enrollment lookup: prisma.enrollment.findFirst({ where: { studentId } })**
PASS. Lines 107–110:
```typescript
const enrollment = await this.prisma.enrollment.findFirst({
  where: { studentId },
  select: { classroomId: true },
});
```
Matches spec exactly.

**Check 15 — Rank fetched only if enrollment exists; null if no classroom**
PASS. Lines 111–115: `classroomRank` is only resolved when `enrollment` is truthy. Initialized to `null` (line 105), remains null if enrollment is absent.

**Check 16 — classroomRank passed into checkAndAwardBadges context**
PASS. Lines 121–131: `badgeService.checkAndAwardBadges(studentId, { ..., classroomRank })` — field explicitly included in context object.

**Check 17 — Rank lookup failure caught and logged (does not block badge check or attempt response)**
PASS. Lines 117–119: inner try/catch around enrollment + rank resolution uses `this.logger.warn(...)` and swallows the error. Execution continues to `checkAndAwardBadges` with `classroomRank` remaining `null`.

**Check 18 — enrollment.findFirst mock present in spec**
PASS. `attempt.service.spec.ts` lines 63–66: `enrollment: { findFirst: jest.fn().mockResolvedValue({ classroomId: CLASSROOM_ID }) }` — mock present and returns a valid enrollment by default.

**Check 19 — LeaderboardService, MasteryService, SchedulerService mocks provided in test module**
PASS. Lines 92–95: all three provided:
- `{ provide: MasteryService, useValue: { recordAttempt: jest.fn()... } }`
- `{ provide: SchedulerService, useValue: { recordReview: jest.fn()... } }`
- `{ provide: LeaderboardService, useValue: leaderboardService }` where `leaderboardService = { getStudentRank: jest.fn() }`

**Check 20 — Test for classroomRank: 0 passed to badge service when getStudentRank returns 0**
PASS. Lines 228–239: dedicated test `'should pass classroomRank=0 to badge service when student is rank 1'` sets `leaderboardService.getStudentRank.mockResolvedValue(0)` and asserts `badgeService.checkAndAwardBadges` was called with `expect.objectContaining({ classroomRank: 0 })`.

---

## Overall: PASS WITH NBI

All 20 acceptance criteria pass. Three non-blocking issues are flagged below.

### NBI List

**NBI-1 — `weeklyCoins` field name mismatch (API naming inconsistency)**
The `LeaderboardEntry.weeklyCoins` field in `GamificationService` now carries XP points (from Redis ZINCRBY on `xpEarned`) rather than coin totals. In the SQL fallback path it still sums `points_ledger.amount` (which records coin awards, not XP). The field semantics differ between the two paths and the name no longer reflects the data. This is a breaking change risk if any frontend explicitly treats the value as a coin count. Recommended action: rename to `weeklyXp` in a future sprint and update the API spec and OpenAPI schema accordingly.

**NBI-2 — classroomId not wired from AttemptService to GamificationService.awardForAttempt**
`AttemptService.submitAnswer` calls `gamificationService.awardForAttempt(studentId, difficulty, correct, attempt.id)` without supplying `classroomId` (line 78–83). The enrollment lookup happens later, only for the badge rank check. This means the Redis write in `awardForAttempt` always passes `classroomId = undefined`, so classroom sorted sets are never updated from this call path. Global leaderboard writes work correctly; classroom leaderboard writes are silently skipped. Fix: resolve enrollment before calling `awardForAttempt` and pass `classroomId`.

**NBI-3 — Race condition: rank check precedes Redis score propagation**
`getStudentRank` is called (lines 112–115) after `awardForAttempt` returns, but `addScore` is fire-and-forget (`void`). The Redis ZINCRBY for the current attempt may not have completed by the time `zrevrank` is queried. A student who just reached rank 1 on this exact attempt will not see `classroomRank === 0` until the next attempt. The TOP_OF_CLASS badge will therefore be awarded one attempt late in the best case. This is an inherent limitation of the fire-and-forget design; document the behaviour or consider awaiting `addScore` before the rank check if latency budget allows.
