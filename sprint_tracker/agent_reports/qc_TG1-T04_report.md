# QC Report: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04  
**Sprint:** 19  
**Reviewed by:** QA agent (two-pass review), 2026-04-28  
**Commit reviewed:** `a66c435`

---

## Summary

- Acceptance criteria reviewed: 8
- Criteria passing: 5
- Criteria failing: 3 (BLOCKER ×4, WARNING ×1, INFO ×1)
- Verdict: **FAIL**

---

## Acceptance Criteria Review

| AC | Description | Result | Notes |
|---|---|---|---|
| AC1 | `playwright.config.ts` exists with `testDir: './e2e'` | ✅ PASS | Exact match to spec |
| AC2 | `golden-path.spec.ts` with full 8-step golden path | ❌ FAIL | All 7 API calls use wrong URL paths — missing `/api` prefix; step 6 also uses `/problems` instead of `/content/problems` |
| AC3 | `apps/web/package.json` has `test:e2e` script and `@playwright/test` devDep | ✅ PASS | `^1.52.0` added correctly |
| AC4 | Root `package.json` has `test:e2e` script | ✅ PASS | `pnpm --filter @koblio/web test:e2e` |
| AC5 | CI `e2e` job with `needs: ci`, Postgres 16 service, all build/migrate/seed/start/smoke steps | ⚠️ PARTIAL | Job structure is correct but health-wait polls `/health` instead of `/api/health` |
| AC6 | Test passes locally — all 8 assertions pass | ❌ FAIL | Two independent failure paths: (1) all API requests 404 due to missing `/api` prefix; (2) step 8 `stats.totalXp` is `undefined` |
| AC7 | `pnpm typecheck` passes | ✅ PASS | 6/6 packages pass, 0 errors |
| AC8 | `pnpm install` succeeds, lockfile updated | ✅ PASS | `@playwright/test@1.59.1` resolved in lockfile (satisfies `^1.52.0`) |

---

## Findings

| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| BLOCKER | Correctness | All 7 API request paths are missing the `/api` global prefix. `apps/api/src/main.ts:26` calls `app.setGlobalPrefix('api')`, which prefixes every NestJS route. The test hits e.g. `/auth/register/teacher` but the actual route is `/api/auth/register/teacher`. Every request in the golden path will receive a 404 and the test fails at step 1. | `apps/web/e2e/golden-path.spec.ts:10–77` | Set `baseURL: 'http://localhost:3001/api'` in the test's `request.newContext()` (and update `playwright.config.ts` `use.baseURL` to match), OR prefix every individual path with `/api/`. |
| BLOCKER | Correctness | Problems endpoint path is wrong. The content controller is declared `@Controller('content')` with `@Get('problems')`, making the full path `/api/content/problems`. The test requests `GET /problems` (resolves to `/api/problems` — non-existent). | `apps/web/e2e/golden-path.spec.ts:55` | Change `'/problems?grade=1&type=FILL_BLANK&limit=1'` to `'/content/problems?grade=1&type=FILL_BLANK&limit=1'` (within whatever base URL scheme is chosen above). |
| BLOCKER | CI/CD | The CI health-wait polls `http://localhost:3001/health` but the health endpoint is at `/api/health` (global prefix applies to `AppController` too). The loop exhausts all 30 retries × 2 s = 60 s without succeeding, then proceeds — the API may have started by then but the wait provides no reliable gate. | `.github/workflows/ci.yml:109` | Change the curl URL to `http://localhost:3001/api/health`. |
| BLOCKER | Spec Mismatch | `GET /attempts/me/stats` does not return `totalXp`. Actual response shape: `{ totalAttempts, correctAttempts, accuracyPercent, topicsAttempted }`. Step 8 asserts `expect(stats.totalXp).toBeGreaterThan(0)` — `stats.totalXp` is `undefined`, so `undefined > 0 === false`. | `apps/web/e2e/golden-path.spec.ts:77`, `apps/api/src/attempt/attempt.service.ts:196–221` | Preferred: add `totalXp` to `getStudentStats` by summing `points_ledger` for the student. Alternative: change the assertion to `expect(stats.correctAttempts).toBeGreaterThan(0)` (lower value — doesn't validate XP persistence). |
| WARNING | CI Reliability | The health-wait loop exits with code 0 even if the API never starts. CI will silently proceed to run tests against a down API, producing obscure connection-refused errors instead of a clear "API did not start" failure. | `.github/workflows/ci.yml:108–112` | Add a failure exit on the last iteration: `for i in $(seq 1 30); do curl -sf http://localhost:3001/api/health && break; [ $i -eq 30 ] && exit 1; sleep 2; done` |
| INFO | Security hygiene | `JWT_SECRET` and `JWT_REFRESH_SECRET` are hardcoded in `ci.yml` as plaintext. These are non-production test-only values per the brief — not a production risk. | `.github/workflows/ci.yml:75–76` | Consider GitHub Actions secrets for defense-in-depth. |

---

## Verdict: FAIL

Four independent blockers prevent the golden path test from running or passing:
1. All API calls 404 (missing `/api` prefix) — the test fails at step 1 before any business logic is exercised.
2. Problems endpoint is at `/content/problems`, not `/problems`.
3. CI health-wait polls the wrong URL and cannot confirm API liveness.
4. `stats.totalXp` is not in the stats API response — step 8 assertion is always false.

The file structure and TypeScript compilation are correct. These are URL-routing and API-shape bugs.

---

## What DEV Must Fix

1. **Fix all request URLs** in `apps/web/e2e/golden-path.spec.ts` — easiest fix is to set `baseURL: 'http://localhost:3001/api'` in `request.newContext()` (line 5) and update `playwright.config.ts` `use.baseURL` to `http://localhost:3001/api`.
2. **Fix problems endpoint path** in `apps/web/e2e/golden-path.spec.ts:55` — change `'/problems?...'` to `'/content/problems?...'`.
3. **Fix CI health-wait URL** in `.github/workflows/ci.yml:109` — change `http://localhost:3001/health` to `http://localhost:3001/api/health`.
4. **Add `totalXp` to stats API** in `apps/api/src/attempt/attempt.service.ts` `getStudentStats()`:

   ```typescript
   const xpLedger = await this.prisma.pointsLedger.aggregate({
     where: { studentId, type: 'XP' },
     _sum: { amount: true },
   });
   const totalXp = xpLedger._sum.amount ?? 0;
   ```

   Return `totalXp` in the response and update the return type. This is the highest-value fix — it validates end-to-end XP persistence.

---

## Positive Observations

- `Date.now()` suffix on teacher email and student username correctly prevents unique-constraint violations between runs.
- `APIRequestContext` (no browser) is the right choice for CI API smoke tests — no `playwright install` needed.
- Lockfile committed alongside the dep addition — no "works on my machine" risk.
- The CI `e2e` job `needs: ci` gate ensures lint/typecheck/unit tests must pass first.
- `api.dispose()` is called at end of test — no leaked HTTP connections.
- Overall test structure and step coverage is correct once URLs are fixed.

---

## Recommended Actions for PM Agent

1. Keep TG1-T04 blocked — return to DEV with the four fixes above (estimated 1 h total).
2. After DEV re-submits, route back to QA for re-review of AC2, AC5, and AC6 only.
3. Add a standing note to future briefs: "All NestJS API endpoints are served under the `/api` global prefix (`apps/api/src/main.ts:26`). Always include `/api/` in request paths." The omission of this detail caused the DEV to use wrong paths throughout.
