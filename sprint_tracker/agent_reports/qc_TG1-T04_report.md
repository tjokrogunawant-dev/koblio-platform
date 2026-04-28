# QC Report: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04  
**Sprint:** 19  
**Reviewed by:** QA agent, 2026-04-28  
**Commit reviewed:** `a66c435`

---

## Summary

- Acceptance criteria reviewed: 8
- Criteria passing: 7
- Criteria failing: 1 (BLOCKER)
- Verdict: **FAIL**

---

## Acceptance Criteria Review

| AC | Description | Result | Notes |
|---|---|---|---|
| AC1 | `playwright.config.ts` exists with `testDir: './e2e'` | ✅ PASS | Exact match to spec |
| AC2 | `golden-path.spec.ts` with full 8-step golden path | ✅ PASS | All 8 steps present |
| AC3 | `apps/web/package.json` has `test:e2e` script and `@playwright/test` devDep | ✅ PASS | `^1.52.0` added correctly |
| AC4 | Root `package.json` has `test:e2e` script | ✅ PASS | `pnpm --filter @koblio/web test:e2e` |
| AC5 | CI `e2e` job with `needs: ci`, Postgres 16 service, all build/migrate/seed/start/smoke steps | ✅ PASS | All steps present and match spec |
| AC6 | Test passes locally — all 8 assertions pass | ❌ FAIL | Step 8 assertion `stats.totalXp > 0` will fail — see blocker below |
| AC7 | `pnpm typecheck` passes | ✅ PASS | 6/6 packages pass, 0 errors |
| AC8 | `pnpm install` succeeds, lockfile updated | ✅ PASS | 17 `@playwright/test` entries in lockfile |

---

## Findings

| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| BLOCKER | Spec Mismatch | `GET /attempts/me/stats` does not return `totalXp`. Actual response shape: `{totalAttempts, correctAttempts, accuracyPercent, topicsAttempted}`. Test at step 8 asserts `expect(stats.totalXp).toBeGreaterThan(0)` — `stats.totalXp` will be `undefined`, and `undefined > 0` is `false`, so the assertion fails. | `apps/web/e2e/golden-path.spec.ts:77`, `apps/api/src/attempt/attempt.service.ts:196-221` | Either (a) add `totalXp` to `getStudentStats` by summing the `points_ledger` for XP-type entries for the student, or (b) change the test assertion to use the actual response field — e.g., `expect(stats.correctAttempts).toBeGreaterThan(0)`. Option (a) is preferred: it validates end-to-end XP persistence, which is the intent. |
| WARNING | CI Reliability | The API health-wait loop (`for i in $(seq 1 30); do curl ... && break; sleep 2; done`) exits with code 0 if the API never starts. If the API fails to boot, CI will proceed to the e2e step and fail with a connection-refused error rather than a clear "API did not start" message. | `.github/workflows/ci.yml:108-112` | Add a fallback exit: `for i in $(seq 1 30); do curl -sf http://localhost:3001/health && break; [ $i -eq 30 ] && exit 1; sleep 2; done` |
| INFO | Security hygiene | `JWT_SECRET` and `JWT_REFRESH_SECRET` are hardcoded in `ci.yml` as plaintext. These are non-production test-only values explicitly called for by the brief, so not a production risk. | `.github/workflows/ci.yml:75-76` | Consider storing even test secrets in GitHub Actions secrets for defense-in-depth (prevents accidental reuse if values are ever copied). |

---

## Verdict: FAIL

The implementation is structurally correct — all files exist, all 7 of 8 structural ACs pass, typecheck is clean, and the CI job is wired correctly. The single blocker is a mismatch between the test's assertion at step 8 and the actual `GET /attempts/me/stats` response shape.

---

## What DEV Must Fix

1. **Fix the `totalXp` mismatch (blocker before this task can be marked done).** Preferred fix: update `getStudentStats` in `apps/api/src/attempt/attempt.service.ts` to include `totalXp` by querying the `points_ledger` table:

   ```typescript
   const xpLedger = await this.prisma.pointsLedger.aggregate({
     where: { studentId, type: 'XP' },
     _sum: { amount: true },
   });
   const totalXp = xpLedger._sum.amount ?? 0;
   ```

   Then return `totalXp` in the response and update the TypeScript return type signature. This is the highest-value fix because it validates actual XP persistence end-to-end.

   Alternative (lower value): change the test assertion to `expect(stats.correctAttempts).toBeGreaterThan(0)` — this validates the attempt was recorded but not that XP was awarded.

---

## Positive Observations

- The use of `Date.now()` suffix on teacher email and student username correctly prevents unique-constraint violations between test runs.
- `APIRequestContext` (no browser) is the right choice — CI doesn't require Playwright browser binaries.
- Lockfile is committed alongside the dep addition — no "works on my machine" risk.
- All 8 golden-path steps are present and map correctly to the actual API endpoint shapes for steps 1–7.
- The CI `e2e` job correctly uses `needs: ci`, ensuring lint/typecheck/unit tests gate the smoke test.

---

## Recommended Actions for PM Agent

1. Keep TG1-T04 as `in-progress` / blocked. Assign back to DEV to fix the `totalXp` stats endpoint mismatch (estimated 30 min).
2. After DEV re-submits, route back to QA for re-review of AC6 only.
