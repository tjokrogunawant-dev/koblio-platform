# Brief: TG1-T04 — Playwright e2e Smoke Tests

## What to Build

Add end-to-end smoke tests that exercise the golden path via the real API using
Playwright's request context (no browser required). The golden path is:

1. Register a teacher
2. Teacher creates a class → retrieve `classCode`
3. Register a student using that `classCode`
4. Student fetches a Grade-1 problem (the API returns `correctAnswer` in the response)
5. Student submits the correct answer via `POST /attempts`
6. Assert: `correct: true`, `xpEarned > 0`
7. Assert: `GET /gamification/me` → `xp > 0`

Tests must be runnable in CI via `pnpm test:e2e` from the repo root.

---

## Files to Create

### `apps/e2e/package.json`
```json
{
  "name": "@koblio/e2e",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0"
  }
}
```

### `apps/e2e/playwright.config.ts`
Configure:
- `baseURL: process.env.API_URL ?? 'http://localhost:3001'`
- `use: { extraHTTPHeaders: {} }` (no global auth — tests set their own tokens)
- `webServer` block (used only when `CI` env var is NOT set — in CI the workflow
  pre-starts the API before running tests):
  ```ts
  webServer: !process.env.CI ? {
    command: 'pnpm --filter @koblio/api run start',
    url: 'http://localhost:3001/health',
    reuseExistingServer: true,
    timeout: 60_000,
  } : undefined,
  ```
- `reporter: [['list'], ['html', { open: 'never' }]]`
- `testDir: './tests'`
- `timeout: 30_000`
- `retries: process.env.CI ? 1 : 0`

### `apps/e2e/tests/golden-path.spec.ts`

Full smoke test. Use `test.describe('Golden path', ...)` with a single `test`.
Use `APIRequestContext` from `@playwright/test`.

Key implementation notes:
- Unique identifiers: use `Date.now()` suffix to avoid conflicts between runs
  - `email: \`teacher_${Date.now()}@e2e.test\``
  - `username: \`student_${Date.now()}\``
- Register teacher:
  ```
  POST /auth/register/teacher
  { name: 'E2E Teacher', email, password: 'Password123!', schoolName: 'Test School', country: 'US' }
  → { access_token: teacherToken }
  ```
- Create class:
  ```
  POST /classrooms   (Authorization: Bearer teacherToken)
  { name: 'E2E Class', grade: 1 }
  → { classCode, id: classroomId }
  ```
- Register student:
  ```
  POST /auth/register/student
  { classCode, displayName: 'E2E Student', username, password: 'Password123!' }
  → { access_token: studentToken }
  ```
- Fetch a problem:
  ```
  GET /problems?grade=1&limit=1   (Authorization: Bearer studentToken)
  → { data: [{ id: problemId, correctAnswer, type }] }
  ```
  The API exposes `correctAnswer` (mapped from `content.answer` via `mapProblem`).
- Submit answer:
  ```
  POST /attempts   (Authorization: Bearer studentToken)
  { problemId, answer: correctAnswer, timeSpentMs: 5000 }
  → { correct: true, xpEarned, coinsEarned }
  ```
  Assert: `expect(body.correct).toBe(true)` and `expect(body.xpEarned).toBeGreaterThan(0)`.
- Verify gamification state:
  ```
  GET /gamification/me   (Authorization: Bearer studentToken)
  → { xp, coins, level }
  ```
  Assert: `expect(body.xp).toBeGreaterThan(0)`.

### `.github/workflows/e2e.yml`

Separate workflow from `ci.yml`. Runs on push/PR to `main`.

```yaml
name: E2E Smoke Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  e2e:
    name: Playwright golden-path
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: koblio
          POSTGRES_PASSWORD: koblio_e2e
          POSTGRES_DB: koblio_e2e
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://koblio:koblio_e2e@localhost:5432/koblio_e2e?schema=public
      JWT_SECRET: e2e-test-jwt-secret-min-32-characters-long
      REDIS_URL: redis://localhost:6379
      NODE_ENV: test
      PORT: 3001
      CI: "true"

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build API
        run: pnpm --filter @koblio/api run build

      - name: Run Prisma migrations
        run: pnpm --filter @koblio/api exec prisma migrate deploy

      - name: Seed database
        run: node apps/api/prisma/seed.js

      - name: Install Playwright (no browsers — API-only tests)
        run: pnpm --filter @koblio/e2e exec playwright install

      - name: Start API server
        run: pnpm --filter @koblio/api run start &
        # wait for health check
      
      - name: Wait for API to be ready
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3001/health && break || sleep 2
          done

      - name: Run E2E smoke tests
        run: pnpm test:e2e
```

---

## Files to Modify

### `package.json` (repo root)
Add to `scripts`:
```json
"test:e2e": "turbo run test:e2e"
```

### `turbo.json`
Add `test:e2e` task inside `"tasks"`:
```json
"test:e2e": {
  "dependsOn": ["^build"],
  "cache": false
}
```

---

## Acceptance Criteria

- [ ] `apps/e2e/package.json` exists with `@playwright/test` in devDependencies
- [ ] `apps/e2e/playwright.config.ts` exists with `baseURL` pointed at `http://localhost:3001`
- [ ] `apps/e2e/tests/golden-path.spec.ts` exists with the full golden-path test
- [ ] The golden-path test passes all 3 assertions: `correct: true`, `xpEarned > 0`, `xp > 0`
- [ ] `.github/workflows/e2e.yml` exists with postgres + redis services and the full job definition
- [ ] Root `package.json` has `"test:e2e": "turbo run test:e2e"`
- [ ] `turbo.json` has `test:e2e` task with `"cache": false`
- [ ] Running `pnpm test:e2e` from the repo root executes the tests (locally, with API already running)
- [ ] No existing tests broken — `pnpm test` (unit tests) still passes

---

## Stack Notes

- Playwright version: `^1.52.0` — use `@playwright/test` package only; `playwright` core
  is not needed for API-only tests
- No browser install flags needed (`--with-deps`) since these tests use `request` context
  only, not a browser
- The API exposes `correctAnswer` on every problem response (see `mapProblem` in
  `apps/api/src/content/content.service.ts`) — read it from the GET /problems response
  rather than hardcoding any answer
- Redis: the `RedisService` uses `redis://localhost:6379` as default; the e2e workflow
  starts a real Redis container so leaderboard code paths work normally
- The `seed.js` file (not `seed.ts`) is used for DB seeding in the e2e workflow, since
  `ts-node` is not available in the built environment. File: `apps/api/prisma/seed.js`
- `POST /auth/register/student` returns `{ access_token, user }` but NOT a refresh cookie
  (unlike teacher/parent routes) — pass the JWT in the `Authorization` header directly
- Classroom `classCode` field: returned in the POST /classrooms response body. The teacher
  dashboard uses it as `cls.classCode`, so the API response field name is `classCode`
- All API calls in tests use `request.post(...)` / `request.get(...)` from Playwright's
  built-in `APIRequestContext` — no `fetch` or `axios` needed

## Definition of Done

All acceptance criteria above have passing tests. DASHBOARD.md and agent_status.md
updated. Changes pushed to master.
