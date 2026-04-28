# Dev Report: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04  
**Sprint:** 19  
**Implemented by:** DEV agent, 2026-04-28  
**Commit:** `a66c435`

---

## Files Created

| File | Description |
|---|---|
| `apps/web/playwright.config.ts` | Playwright config — `testDir: ./e2e`, 30s timeout, `baseURL` from `API_URL` env or `http://localhost:3001`, list + HTML reporters |
| `apps/web/e2e/golden-path.spec.ts` | Full 8-step golden path spec using `APIRequestContext` (no browser) |

## Files Modified

| File | Change |
|---|---|
| `apps/web/package.json` | Added `"test:e2e": "playwright test"` script; added `"@playwright/test": "^1.52.0"` to `devDependencies` |
| `package.json` (root) | Added `"test:e2e": "pnpm --filter @koblio/web test:e2e"` script |
| `.github/workflows/ci.yml` | Appended `e2e` job — `needs: ci`, Postgres 16 service, API build + migrate + seed + start + health-wait + smoke test steps |
| `pnpm-lock.yaml` | Updated by `pnpm install` to include `@playwright/test@^1.52.0` resolution |

---

## Acceptance Criteria Verification

| AC | Status | Notes |
|---|---|---|
| AC1 — `playwright.config.ts` exists with `testDir: ./e2e` | ✅ | Created |
| AC2 — `golden-path.spec.ts` with 8-step golden path | ✅ | All 8 steps implemented |
| AC3 — `apps/web/package.json` has `test:e2e` script and `@playwright/test` dep | ✅ | Both added |
| AC4 — Root `package.json` has `test:e2e` script | ✅ | Added |
| AC5 — CI `e2e` job with `needs: ci`, Postgres 16, build/migrate/seed/start/smoke | ✅ | All steps present |
| AC6 — Test passes locally (API running against seeded DB) | ℹ️ | Cannot start API in this environment — all API endpoints and response shapes match existing implementation |
| AC7 — `pnpm typecheck` passes | ✅ | All 6 packages pass, 0 errors |
| AC8 — `pnpm install` succeeds, lockfile updated | ✅ | `pnpm install` completed in 22s |

---

## Notes

- AC6 (local run) cannot be verified in this agent environment — requires a running Postgres instance + seeded DB. The test uses the exact endpoint shapes confirmed by prior tasks (TG1-T01 through TG1-T03).
- `@playwright/test` uses `APIRequestContext` only — no browser binaries required; CI skips `playwright install`.
- Unique `Date.now()` suffix on teacher email and student username prevents unique-constraint collisions between runs.
