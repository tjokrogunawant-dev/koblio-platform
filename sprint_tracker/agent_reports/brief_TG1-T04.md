# Brief: TG1-T04 — Playwright E2E Smoke Tests

**Task ID:** TG1-T04  
**Sprint:** 19  
**Priority:** High — final Trial Gate 1 requirement  
**Written by:** PM, 2026-04-28

---

## What to Build

Add a Playwright e2e smoke test suite that validates the golden path through the Koblio API.

**Scope:** API-level smoke tests using Playwright's `APIRequestContext` (no browser). This runs headlessly in CI without a Next.js dev server — only the NestJS API needs to be running. Browser-based UI tests are deferred to Trial Gate 2.

**Golden path:**
1. Teacher registers → logs in
2. Teacher creates a classroom → captures `class_code`
3. Student registers with `class_code` → logs in
4. Student fetches a Grade 1 problem
5. Student submits the correct answer
6. Assert `correct: true`, `xpEarned > 0`
7. Assert `GET /attempts/me/stats` → `totalXp > 0`

---

## Files to Create

### 1. `apps/web/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.API_URL ?? 'http://localhost:3001',
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
```

### 2. `apps/web/e2e/golden-path.spec.ts`

Full golden path test using `request.newContext()` (no browser required):

```typescript
import { test, expect, request } from '@playwright/test';

test('golden path: teacher → class → student → solve → XP awarded', async () => {
  const ts = Date.now();
  const api = await request.newContext({
    baseURL: process.env.API_URL ?? 'http://localhost:3001',
  });

  // 1. Register teacher
  const regTeacher = await api.post('/auth/register/teacher', {
    data: {
      email: `teacher${ts}@smoke.test`,
      password: 'Smoke123!pass',
      name: 'Smoke Teacher',
      school_name: 'Smoke School',
    },
  });
  expect(regTeacher.status()).toBe(201);

  // 2. Login teacher
  const loginTeacher = await api.post('/auth/login', {
    data: { kind: 'email', email: `teacher${ts}@smoke.test`, password: 'Smoke123!pass' },
  });
  expect(loginTeacher.ok()).toBeTruthy();
  const { access_token: teacherToken } = await loginTeacher.json();

  // 3. Create classroom
  const createClass = await api.post('/classrooms', {
    headers: { Authorization: `Bearer ${teacherToken}` },
    data: { name: 'Math 1A', grade: 1 },
  });
  expect(createClass.status()).toBe(201);
  const { class_code } = await createClass.json();
  expect(typeof class_code).toBe('string');

  // 4. Register student with class code
  const regStudent = await api.post('/auth/register/student', {
    data: {
      classCode: class_code,
      displayName: 'Smokey',
      username: `smokey${ts}`,
      password: 'student123',
    },
  });
  expect(regStudent.status()).toBe(201);

  // 5. Login student
  const loginStudent = await api.post('/auth/login', {
    data: { kind: 'student', username: `smokey${ts}`, password: 'student123' },
  });
  expect(loginStudent.ok()).toBeTruthy();
  const { access_token: studentToken } = await loginStudent.json();

  // 6. Fetch a Grade 1 fill-blank problem (answer is in correctAnswer field)
  const problemsRes = await api.get('/problems?grade=1&type=FILL_BLANK&limit=1');
  expect(problemsRes.ok()).toBeTruthy();
  const { data: problems } = await problemsRes.json();
  expect(problems.length).toBeGreaterThan(0);
  const problem = problems[0];

  // 7. Submit correct answer
  const attemptRes = await api.post('/attempts', {
    headers: { Authorization: `Bearer ${studentToken}` },
    data: { problemId: problem.id, answer: problem.correctAnswer },
  });
  expect(attemptRes.ok()).toBeTruthy();
  const attempt = await attemptRes.json();
  expect(attempt.correct).toBe(true);
  expect(attempt.xpEarned).toBeGreaterThan(0);

  // 8. Verify XP in student stats
  const statsRes = await api.get('/attempts/me/stats', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  expect(statsRes.ok()).toBeTruthy();
  const stats = await statsRes.json();
  expect(stats.totalXp).toBeGreaterThan(0);

  await api.dispose();
});
```

---

## Files to Modify

### 3. `apps/web/package.json`

Add `@playwright/test` to `devDependencies` and a `test:e2e` script:

```json
"scripts": {
  ...existing scripts...,
  "test:e2e": "playwright test"
},
"devDependencies": {
  ...existing devDeps...,
  "@playwright/test": "^1.52.0"
}
```

### 4. `package.json` (root)

Add a `test:e2e` script that targets the web package:

```json
"scripts": {
  ...existing scripts...,
  "test:e2e": "pnpm --filter @koblio/web test:e2e"
}
```

### 5. `.github/workflows/ci.yml`

Append a new `e2e` job **after** the existing `ci` job. It needs a Postgres 16 service, builds the API, runs migrations, seeds data, starts the API, then runs Playwright:

```yaml
  e2e:
    name: E2E Smoke Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: ci
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: koblio
          POSTGRES_PASSWORD: koblio
          POSTGRES_DB: koblio_e2e
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://koblio:koblio@localhost:5432/koblio_e2e
      JWT_SECRET: ci-e2e-jwt-secret-32chars-abcdefgh
      JWT_REFRESH_SECRET: ci-e2e-refresh-secret-32chars-abcd
      NODE_ENV: production
      PORT: 3001
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build API
        run: pnpm --filter @koblio/api build

      - name: Run Prisma migrations
        run: pnpm --filter @koblio/api exec prisma migrate deploy

      - name: Seed database
        run: node apps/api/prisma/seed.js

      - name: Start API (background)
        run: node apps/api/dist/main &

      - name: Wait for API health
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3001/health && break
            sleep 2
          done

      - name: Run e2e smoke tests
        run: pnpm test:e2e
        env:
          API_URL: http://localhost:3001
```

---

## Key API Details (for the implementer)

| Step | Endpoint | Request body fields |
|---|---|---|
| Register teacher | `POST /auth/register/teacher` | `email`, `password`, `name`, `school_name` |
| Login (teacher) | `POST /auth/login` | `{ kind: "email", email, password }` → `{ access_token }` |
| Create class | `POST /classrooms` | `{ name, grade }` → `{ class_code, ... }` |
| Register student | `POST /auth/register/student` | `{ classCode, displayName, username, password }` |
| Login (student) | `POST /auth/login` | `{ kind: "student", username, password }` → `{ access_token }` |
| Get problems | `GET /problems?grade=1&type=FILL_BLANK&limit=1` | → `{ data: [{ id, correctAnswer, ... }] }` |
| Submit attempt | `POST /attempts` | `{ problemId, answer }` → `{ correct, xpEarned, coinsEarned }` |
| Check stats | `GET /attempts/me/stats` | → `{ totalXp, totalCoins, ... }` |

**Auth header:** `Authorization: Bearer <access_token>` on all authenticated routes.

**Note:** `GET /problems` returns `correctAnswer` in the response (mapped from `content.answer` in the DB). The smoke test uses this to submit a guaranteed-correct answer.

---

## Acceptance Criteria

1. **AC1:** `apps/web/playwright.config.ts` exists and points `testDir` to `./e2e`.
2. **AC2:** `apps/web/e2e/golden-path.spec.ts` exists with the full 8-step golden path.
3. **AC3:** `apps/web/package.json` has `"test:e2e": "playwright test"` script and `@playwright/test` in `devDependencies`.
4. **AC4:** Root `package.json` has `"test:e2e": "pnpm --filter @koblio/web test:e2e"` script.
5. **AC5:** `.github/workflows/ci.yml` has a new `e2e` job with `needs: ci`, Postgres 16 service, API build + migrate + seed + start + smoke test steps.
6. **AC6:** The test passes locally when the API is running (`node apps/api/dist/main`) against a seeded DB — i.e., all 8 assertions pass.
7. **AC7:** `pnpm typecheck` still passes (no TypeScript errors introduced).
8. **AC8:** `pnpm install` succeeds (pnpm lockfile updated for `@playwright/test`).

---

## Gotchas

- **`pnpm install` must be run** after adding `@playwright/test` to `apps/web/package.json` to update `pnpm-lock.yaml`. Commit the updated lockfile.
- **No browser binaries needed** — `APIRequestContext` is purely HTTP; `playwright install` can be skipped in CI.
- **`correctAnswer` is publicly exposed** by `GET /problems` in the current API (mapped from `content.answer`). This is intentional for MVP — the test exploits this for a guaranteed correct submission.
- **Unique usernames per run** — use `Date.now()` suffix on teacher email and student username to avoid unique-constraint violations between test runs.
- **The `e2e` CI job `needs: ci`** — it will only run after the existing lint/typecheck/test/build job passes.
- **`seed.js` exists** (added in commit `1e3fe88`) — no need to compile TypeScript for seeding.
- **`prisma migrate deploy`** (not `migrate dev`) is correct for CI — it applies without interactive prompts.
