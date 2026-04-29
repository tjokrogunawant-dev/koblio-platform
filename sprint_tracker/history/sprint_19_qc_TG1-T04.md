# QC Report: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04
**Sprint:** 19
**QA date:** 2026-04-29
**Verdict:** PASS WITH NBI

---

## Acceptance Criteria Review

| AC | Criterion | Status | Notes |
|---|---|---|---|
| AC1 | `apps/web/playwright.config.ts` exists with `testDir: ./e2e`, 30s timeout, `baseURL` from `API_URL` | ✅ PASS | File matches brief exactly |
| AC2 | `apps/web/e2e/golden-path.spec.ts` has all 8 steps with correct assertions | ✅ PASS | All steps verified: register teacher, login teacher, create class, register student, login student, fetch problem, submit answer, check stats |
| AC3 | `apps/web/package.json` has `"test:e2e": "playwright test"` and `@playwright/test ^1.52.0` in devDependencies | ✅ PASS | Both present |
| AC4 | Root `package.json` has `"test:e2e": "pnpm --filter @koblio/web test:e2e"` | ✅ PASS | Present |
| AC5 | `.github/workflows/ci.yml` `e2e` job has `needs: ci`, Postgres 16 service, all 8 steps (checkout, pnpm, node, install, build API, migrate, seed, start, health-wait, run tests) | ✅ PASS | All steps match brief exactly |
| AC6 | Test passes locally against running API + seeded DB | ⚠️ UNVERIFIED | No live API in QA environment. All API contracts match established implementations from TG1-T01/T02/T03. Will be confirmed on first CI e2e run. |
| AC7 | `pnpm typecheck` passes, 0 errors | ✅ PASS | 6/6 packages pass, 0 TypeScript errors |
| AC8 | `pnpm install` succeeds, lockfile updated for `@playwright/test` | ✅ PASS | `@playwright/test` resolved in lockfile (11 entries); `pnpm install --frozen-lockfile` completes in 19.5s |

---

## Code Review Notes

### `apps/web/playwright.config.ts`
- Minimal, correct config. `testDir`, `timeout`, `baseURL`, and dual reporters match brief.
- No issues.

### `apps/web/e2e/golden-path.spec.ts`
- Single test covers all 8 golden-path steps in sequence.
- `Date.now()` suffix on teacher email and student username prevents unique-constraint collisions between runs — correct.
- Uses `request.newContext()` (not browser page) — correct for API-only smoke tests.
- `problem.correctAnswer` sourced from `GET /problems` response — matches existing API implementation.
- `api.dispose()` called at end of test — proper cleanup.
- No issues.

### `apps/web/package.json`
- `@playwright/test: "^1.52.0"` in `devDependencies` — correct placement (not dependencies).
- `test:e2e` script added alongside existing `test` (Jest) — no conflict.

### Root `package.json`
- `test:e2e` uses `pnpm --filter @koblio/web test:e2e` — correct scoped invocation.

### `.github/workflows/ci.yml` — `e2e` job
- `needs: ci` ensures lint/typecheck/test/build passes first.
- Postgres 16 service with health-check options — correct.
- JWT secrets are CI-specific hardcoded values — correct for ephemeral CI environment.
- `prisma migrate deploy` (not `migrate dev`) — correct for non-interactive CI.
- `node apps/api/prisma/seed.js` — uses the pre-existing `seed.js` (added in commit `1e3fe88`) — correct.
- Health-wait loop: 30 iterations × 2s = up to 60s — sufficient for API cold start.
- No `playwright install` step — correct, `APIRequestContext` needs no browser binaries.

---

## Notes Before Implementation (NBI)

**NBI-1 (Low):** AC6 (live test execution) is unverifiable in this agent environment. The first push to `main` after this commit will trigger the CI `e2e` job and serve as the definitive verification. If it fails, the most likely causes are: (a) seeded DB has no Grade 1 FILL_BLANK problems matching the query, or (b) API startup takes longer than 60s on GitHub's runners. Both are low-risk given the established seed data.

---

## Summary

7 of 8 ACs verified directly. AC6 (runtime test execution) deferred to CI — all code is correct and consistent with the established API contracts. No blocking issues found.
