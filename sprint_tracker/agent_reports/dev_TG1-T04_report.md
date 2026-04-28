# DEV Report: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04  
**Sprint:** 19  
**Implemented by:** DEV Agent  
**Date:** 2026-04-28

---

## What Was Built

Added a Playwright API-level e2e smoke test suite covering the full golden path through the Koblio API. No browser binaries are required — the test uses `APIRequestContext` (pure HTTP) only.

---

## Files Created

| File | Description |
|---|---|
| `apps/web/playwright.config.ts` | Playwright config: `testDir = ./e2e`, 30s timeout, `baseURL` from `API_URL` env var |
| `apps/web/e2e/golden-path.spec.ts` | 8-step golden path test: register teacher → login → create classroom → register student → login → fetch problem → submit correct answer → assert XP in stats |

## Files Modified

| File | Change |
|---|---|
| `apps/web/package.json` | Added `"test:e2e": "playwright test"` script; added `@playwright/test: ^1.52.0` to devDependencies |
| `package.json` (root) | Added `"test:e2e": "pnpm --filter @koblio/web test:e2e"` script |
| `.github/workflows/ci.yml` | Appended `e2e` job with `needs: ci`, Postgres 16 service container, API build + migrate + seed + start + smoke test steps |
| `pnpm-lock.yaml` | Updated by `pnpm install` after adding `@playwright/test` |

---

## Deviations from Brief

None. The implementation follows the brief exactly.

---

## Test Results

- `pnpm typecheck`: **PASS** — 6/6 packages, 0 errors
- `pnpm install`: **PASS** — lockfile updated, `@playwright/test` resolved
- AC6 (local API runtime test): Not verified in this environment — requires a running API with seeded DB. CI job is wired to provide this environment automatically.

---

## Acceptance Criteria Status

| AC | Status | Notes |
|---|---|---|
| AC1: `playwright.config.ts` exists with `testDir: ./e2e` | ✅ | Created |
| AC2: `e2e/golden-path.spec.ts` with 8-step golden path | ✅ | Created |
| AC3: `test:e2e` script + `@playwright/test` in web `package.json` | ✅ | Done |
| AC4: Root `package.json` has `test:e2e` script | ✅ | Done |
| AC5: CI `e2e` job with `needs: ci`, Postgres, build/migrate/seed/start/test steps | ✅ | Done |
| AC6: Test passes locally against seeded API | ⏳ | Requires running API — QA to verify on next CI run |
| AC7: `pnpm typecheck` passes | ✅ | 6/6 packages pass |
| AC8: `pnpm install` succeeds + lockfile updated | ✅ | Done |
