# QC Report: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04  
**Sprint:** 19  
**QC by:** QA agent, 2026-04-28  
**Verdict:** FAIL — 1 blocker

---

## Blocker: `GET /attempts/me/stats` does not return `totalXp`

The golden-path test step 8 asserts:
```typescript
expect(stats.totalXp).toBeGreaterThan(0);
```

But `AttemptService.getStudentStats` (attempt.service.ts:196–221) returns only:
```typescript
{ totalAttempts, correctAttempts, accuracyPercent, topicsAttempted }
```

`totalXp` is not included. The assertion will always fail (`undefined > 0` → false). This is a test-time runtime failure, not a TypeScript error, which is why `pnpm typecheck` passes.

**Fix options (for DEV):**
1. **Preferred:** Add `totalXp` and `totalCoins` to `getStudentStats` by reading from `user.xp` / `user.coins` (or from the gamification ledger). The `User` model holds cumulative `xp` and `coins` from the gamification module.
2. **Alternate:** Change step 8 to call a different endpoint that already returns XP (e.g., `GET /me` user profile if it includes `xp`).

---

## Acceptance Criteria Review

| AC | Criterion | Result | Notes |
|---|---|---|---|
| AC1 | `playwright.config.ts` exists with `testDir: ./e2e` | ✅ PASS | Exact match to brief spec |
| AC2 | `golden-path.spec.ts` — full 8-step golden path | ✅ PASS (structure) | All 8 steps present — step 8 assertion is wrong (see blocker) |
| AC3 | `apps/web/package.json` — `test:e2e` script + `@playwright/test` devDep | ✅ PASS | Both present |
| AC4 | Root `package.json` — `test:e2e` script | ✅ PASS | Present |
| AC5 | CI `e2e` job — `needs: ci`, Postgres 16, build/migrate/seed/start/health/smoke | ✅ PASS | All steps correct |
| AC6 | Test passes locally | ❌ FAIL | Step 8 will fail at runtime — `stats.totalXp` is undefined |
| AC7 | `pnpm typecheck` passes | ✅ PASS | No TypeScript errors (runtime issue only) |
| AC8 | `pnpm install` succeeds, lockfile updated | ✅ PASS | 11 lockfile entries for `@playwright/test` |

---

## Required Fix

DEV must update `AttemptService.getStudentStats` to include `totalXp` (and optionally `totalCoins`) sourced from the `User` record. Example:

```typescript
async getStudentStats(studentId: string) {
  const [totalAttempts, correctAttempts, attemptedProblems, user] = await Promise.all([
    this.prisma.studentProblemAttempt.count({ where: { studentId } }),
    this.prisma.studentProblemAttempt.count({ where: { studentId, correct: true } }),
    this.prisma.studentProblemAttempt.findMany({
      where: { studentId },
      distinct: ['problemId'],
      include: { problem: { select: { topic: true } } },
    }),
    this.prisma.user.findUnique({ where: { id: studentId }, select: { xp: true, coins: true } }),
  ]);
  // ... existing accuracy/topics logic ...
  return { totalAttempts, correctAttempts, accuracyPercent, topicsAttempted,
           totalXp: user?.xp ?? 0, totalCoins: user?.coins ?? 0 };
}
```

DEV should also update `attempt.controller.spec.ts` to cover the new fields.
