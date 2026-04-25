# QC Report — Sprint 03 — 2026-04-25

## Summary
- Tasks reviewed: 8
- Tasks passing all criteria: 0
- Tasks with findings: 1 (P1-T10)
- Tasks with no evidence: 7
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Status:** APPROVED WITH WARNINGS

**Commit:** `acabf47` — 1,689 lines added across 16 files

**Acceptance Criteria Coverage:**
| # | Criterion | Met? |
|---|-----------|------|
| 1 | POST `/auth/register/parent` creates parent account | Yes |
| 2 | POST `/auth/register/teacher` creates teacher account with school (transaction) | Yes |
| 3 | POST `/auth/login` returns JWT + sets httpOnly refresh cookie | Yes |
| 4 | POST `/auth/refresh` rotates tokens, checks Redis revocation list | Yes |
| 5 | POST `/auth/logout` revokes refresh token in Redis + Auth0 | Yes |
| 6 | Unit tests for all endpoints | Yes (56 unit tests across 4 test files) |
| 7 | 401 returned on expired/invalid tokens | Yes |

**Findings:**
| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Testing | No integration or e2e tests for auth API endpoints. All 56 tests are unit tests with mocked dependencies — no real HTTP request coverage. | `apps/api/src/auth/` | Add Supertest-based integration tests exercising the full NestJS request pipeline (validation, guards, cookies). Estimate: 1 day. |
| WARNING | Security | CORS configured with `origin: true` and `credentials: true`. This reflects any requesting origin in `Access-Control-Allow-Origin`, effectively acting as a wildcard with credentials. Mitigated partially by `sameSite: strict` on refresh cookie and Bearer token auth, but still overly permissive. | `apps/api/src/main.ts:14` | Replace `origin: true` with an explicit allowlist from env var (e.g., `CORS_ALLOWED_ORIGINS`). Must be locked down before any production or staging deployment. |
| WARNING | Architecture | `Auth0ClientService.assignRoles()` silently swallows HTTP failures — logs an error but does not throw. A user could be created in both Auth0 and Prisma without their Auth0 role being assigned, causing authorization failures on subsequent logins. | `apps/api/src/auth/auth0-client.service.ts:235` | Throw an exception on role assignment failure, or implement a compensating rollback (delete the Auth0 user). The current behavior creates a state where the user exists but can't authorize. |
| WARNING | COPPA | No application-level PII encryption on the `email` field in the User model. Database-level encryption (e.g., AWS RDS at-rest encryption) is not yet provisioned since AWS credentials are blocked. | `apps/api/prisma/schema.prisma:25` | Track as a prerequisite for production deployment. Either use Prisma middleware for field-level encryption or confirm AWS RDS encryption is enabled when infra is provisioned. |
| INFO | Code Quality | Registration DTOs lack an explicit `consent` or `terms_accepted` boolean field. The acceptance criteria mentions "Auth0 consent recorded" — this may need a frontend-supplied consent flag persisted alongside account creation. | `apps/api/src/auth/dto/register-parent.dto.ts` | Add optional `termsAccepted: boolean` field to DTOs and store consent timestamp. Coordinate with P1-T13 (Auth Frontend) for implementation. |
| INFO | Code Quality | `Auth0UserResponse` interface uses index signature `[key: string]: unknown` which loosens type safety. | `apps/api/src/auth/auth0-client.service.ts:23` | Replace with explicit optional fields for the properties actually used from Auth0's response. |

**Verdict:** APPROVED WITH WARNINGS

---

### P1-T09 — Sentry Error Tracking Setup (web + API)

**Status:** NO EVIDENCE

No commits found. Task status: `pending`.

---

### P1-T17 — KaTeX Integration — Web Math Rendering

**Status:** NO EVIDENCE

No commits found. Task status: `pending`.

---

### P1-T11 — Auth Module — Student Login & RBAC enforcement

**Status:** NO EVIDENCE

No commits found. Task status: `pending`. Depends on P1-T10 (done).

---

### P1-T14 — MongoDB Problem Document Schema & API

**Status:** NO EVIDENCE

No commits found. Task status: `pending`.

---

### P1-T12 — User Module — Parent-Child Linking & School Association

**Status:** NO EVIDENCE

No commits found. Task status: `pending`. Depends on P1-T10 (done) and P1-T11.

---

### P1-T13 — Auth Frontend — Login & Registration Pages

**Status:** NO EVIDENCE

No commits found. Task status: `pending`. Depends on P1-T10, P1-T11, P1-T08 (done).

---

### P1-T15 — Admin CMS for Problem Authoring

**Status:** NO EVIDENCE

No commits found. Task status: `pending`. Stretch goal — depends on P1-T14.

---

## Blockers for Next Sprint
None. No BLOCKER-severity findings.

## Architecture Drift
- **CORS policy** (`main.ts:14`): `origin: true` deviates from production security posture. Must be resolved before any deployment with real user data.
- **Silent role assignment failure** (`auth0-client.service.ts:235`): Creates a partial-state risk where a user exists without proper Auth0 roles. This pattern should not be replicated in P1-T11 (Student Login & RBAC).

## Positive Observations
1. **Secure token handling:** SHA-256 hashed refresh tokens in Redis — no plaintext token storage anywhere. Refresh token rotation with revocation list is a strong security pattern.
2. **COPPA-compliant session cookies:** httpOnly + sameSite:strict + secure (production) on refresh cookies. Access tokens delivered via Bearer header, not cookies. No localStorage usage.
3. **Transactional integrity:** Teacher registration uses `prisma.$transaction()` to atomically create User + School + SchoolTeacher records. Prevents orphaned records on partial failure.
4. **Auth0 management token caching:** Cached with 60-second buffer before expiry, avoiding redundant token requests to Auth0.
5. **Clean module architecture:** Auth0ClientService properly abstracts the Auth0 Management and Authentication APIs behind a single injectable service. Redis service is `@Global()` and reusable.
6. **Comprehensive unit tests:** 56 tests across 4 spec files covering happy paths, error cases, edge cases (missing cookies, revoked tokens, duplicate emails).
7. **Input validation:** DTOs use class-validator with `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` — rejects unknown fields and enforces type constraints.
8. **Forward-looking DTOs:** `login.dto.ts` already defines `StudentLoginDto` and `ClassCodeLoginDto` for P1-T11, reducing rework.

## Recommended Actions for PM Agent
1. Add "Auth integration tests (Supertest)" task to Sprint 04 backlog — estimated 1 day
2. Add "Lock down CORS allowlist via env var" task to Sprint 04 backlog — estimated 0.5 days
3. Add "Fix Auth0ClientService.assignRoles error handling" task to P1-T11 scope or Sprint 04 — estimated 0.5 days
4. Note: 7 of 8 Sprint 03 tasks show no commits as of mid-sprint (Day 4 of 10). P1-T11 is unblocked (depends only on P1-T10 which is done) and should be the next implementation priority.
5. Track PII at-rest encryption as a prerequisite for production deployment checklist (tied to P1-T03 AWS provisioning).
