# QC Report — Sprint 03 — 2026-04-24

## Summary
- Tasks reviewed: 8
- Tasks passing all criteria: 1
- Tasks with findings: 1 (P1-T10 — approved with warnings)
- Tasks with no evidence: 7
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module: Parent & Teacher Registration Endpoints

**Status:** DONE (commit `acabf47`)

**Acceptance Criteria Check:**
| Criterion | Status |
|---|---|
| POST `/auth/register/parent` creates parent account | PASS |
| POST `/auth/register/teacher` creates teacher account | PASS |
| POST `/auth/login` returns JWT + sets refresh cookie | PASS |
| POST `/auth/refresh` rotates tokens | PASS |
| POST `/auth/logout` revokes refresh token in Redis + Auth0 | PASS |
| Auth0 role assignment + app_metadata | PASS |
| Unit tests for all endpoints | PASS |
| 401 on expired/invalid tokens | PASS |

**Findings:**
| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Security | CORS configured with `origin: true` — reflects any request origin, allowing credentialed cross-origin requests from any domain | `apps/api/src/main.ts:14` | Restrict to explicit allowed origins via env var (e.g. `CORS_ALLOWED_ORIGINS`) before any staging deploy |
| WARNING | Testing | No integration/E2E tests for auth endpoints — only unit tests with mocked dependencies | `apps/api/src/auth/` | Add Supertest-based integration tests or Playwright E2E for register/login/refresh/logout flows |
| WARNING | Resilience | `assignRoles()` silently swallows Auth0 role-assignment failures (logs error but does not throw) — user could be created without Auth0 roles | `apps/api/src/auth/auth0-client.service.ts:235-238` | Throw on role-assignment failure so the registration transaction rolls back, or retry with backoff |
| INFO | Validation | `school_country` is optional in `RegisterTeacherDto` but used directly as `country` in both User and School creation — could produce null country values | `apps/api/src/auth/dto/register-teacher.dto.ts:30`, `apps/api/src/auth/auth.service.ts:134,141` | Either make `school_country` required or provide a default |

**Verdict:** APPROVED WITH WARNINGS

---

### P1-T09 — Sentry Error Tracking Setup (web + API)

**Status:** NO EVIDENCE — no commits found for this task.

---

### P1-T17 — KaTeX Integration: Web Math Rendering

**Status:** NO EVIDENCE — no commits found for this task.

---

### P1-T11 — Auth Module: Student Login & RBAC Enforcement

**Status:** NO EVIDENCE — task status is `pending` and no commits found. Note: DTOs for student login and class-code login are already defined in `apps/api/src/auth/dto/login.dto.ts` (from P1-T10 commit), which gives P1-T11 a head start.

---

### P1-T14 — MongoDB Problem Document Schema & API

**Status:** NO EVIDENCE — task status is `pending` and no commits found.

---

### P1-T12 — User Module: Parent-Child Linking & School Association

**Status:** NO EVIDENCE — task status is `pending`, depends on P1-T10 (done) and P1-T11.

---

### P1-T13 — Auth Frontend: Login & Registration Pages

**Status:** NO EVIDENCE — task status is `pending`, depends on P1-T10 and P1-T11.

---

### P1-T15 — Admin CMS for Problem Authoring

**Status:** NO EVIDENCE — task status is `pending`, stretch goal dependent on P1-T14.

---

## Blockers for Next Sprint
None. All findings on P1-T10 are WARNING or INFO severity.

## Architecture Drift
No architecture drift detected. The auth module follows NestJS modular monolith patterns correctly:
- `AuthModule` properly encapsulated with DI-based service injection
- `RedisModule` is `@Global` (acceptable for shared infrastructure)
- All database writes go through Prisma ORM with transactions where needed
- No cross-module direct imports — everything through NestJS providers

## Positive Observations
1. **Refresh token security is excellent** — SHA-256 hashing of tokens before Redis storage, httpOnly + secure + sameSite:strict cookies, scoped to `/api/auth` path, 7-day TTL with revocation list
2. **Teacher registration uses Prisma `$transaction`** for atomic creation of User + School + SchoolTeacher — prevents orphaned records on partial failure
3. **Comprehensive unit test coverage** — 62+ tests across controller, service, Auth0 client, Redis service, JWT strategy, guards, covering both happy paths and error cases
4. **COPPA-compliant design** — Student accounts have no email field, `AuthenticatedUser` interface makes email optional, JWT strategy test explicitly validates student-without-email case
5. **Auth0 Management API token caching** with 60-second early-expiry buffer prevents unnecessary token fetches
6. **AbortSignal.timeout(10s)** on all external Auth0 API calls prevents hung requests
7. **Input validation** via class-validator decorators with `whitelist: true` + `forbidNonWhitelisted: true` at the global pipe level prevents mass-assignment attacks

## Recommended Actions for PM Agent
1. Add "CORS origin restriction" task to Sprint 04 backlog — estimated 0.5 days (WARNING: must be done before any staging/production deploy)
2. Add "Auth integration tests with Supertest" task to Sprint 04 backlog — estimated 1 day
3. Consider making `assignRoles` failure throw in Auth0ClientService to prevent silent role-assignment failures — estimated 0.5 days
4. P1-T11 (Student Login & RBAC) should be top priority for remaining Sprint 03 days — its DTOs are already scaffolded
5. 7 of 8 Sprint 03 tasks have no commits yet — PM should assess whether sprint scope needs reduction
