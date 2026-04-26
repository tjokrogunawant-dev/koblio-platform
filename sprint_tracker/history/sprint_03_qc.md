# QC Report — Sprint 03 — 2026-04-26

## Summary
- Tasks reviewed: 8
- Tasks passing all criteria: 1
- Tasks with findings: 1 (P1-T10 — approved with warnings)
- Tasks with no evidence: 7
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Status:** PASS (with warnings)

**Commit:** `acabf47` — [P1-T10] Implement Auth Module — Parent & Teacher Registration endpoints

**Acceptance Criteria Verification:**
| # | Criterion | Met? |
|---|-----------|------|
| 1 | POST `/auth/register/parent` creates parent account | YES — Auth0 Management API + Prisma user create |
| 2 | POST `/auth/register/teacher` creates teacher with school | YES — Prisma `$transaction` for atomic user+school+schoolTeacher |
| 3 | POST `/auth/login` returns JWT + sets refresh cookie | YES — httpOnly cookie, sameSite strict, secure in prod |
| 4 | POST `/auth/refresh` rotates tokens | YES — revokes old token hash, sets new cookie |
| 5 | POST `/auth/logout` revokes refresh token | YES — Redis revocation list + Auth0 revoke + clears cookie |
| 6 | Unit tests for all endpoints | YES — 49 unit tests across 4 spec files |
| 7 | 401 returned on expired/invalid tokens | YES — UnauthorizedException on bad credentials, revoked tokens |

**Checklist Results:**

Code Quality:
- [x] No TODO/FIXME in deliverable code paths
- [x] No `any` types in TypeScript
- [x] No hardcoded credentials — all secrets via ConfigService (`AUTH0_CLIENT_SECRET`, `AUTH0_ISSUER_URL`, etc.)
- [x] Error handling at system boundaries — Auth0 calls wrapped with timeout, status checks, typed exceptions
- [x] No SQL injection vectors — all DB access via Prisma parameterized queries

Testing:
- [x] Unit tests exist for business logic (49 tests: auth.service 19, auth.controller 14, auth0-client 10, redis 6)
- [ ] **No integration tests for API endpoints** — spec files use mocked dependencies only
- [x] E2E not applicable (backend-only task; E2E applies when frontend flows exist per P1-T13)

Architecture Compliance:
- [x] NestJS modular monolith pattern followed — AuthModule imports PassportModule, provides Auth0ClientService; RedisModule is @Global
- [x] Database writes through Prisma ORM — no raw SQL
- [x] RedisService wraps ioredis with proper OnModuleDestroy cleanup
- [x] No setTimeout/setInterval for async work

COPPA/Privacy:
- [x] No email collection from under-13 — registration endpoints are parent/teacher only
- [x] Session tokens are httpOnly cookies, not localStorage
- [x] Refresh tokens SHA-256 hashed before Redis storage (never plaintext)
- [x] Cookie: `httpOnly: true`, `sameSite: 'strict'`, `secure: true` in production, path scoped to `/api/auth`

**Findings:**

| Severity | Category | Finding | File:Line | Recommendation |
|----------|----------|---------|-----------|----------------|
| WARNING | Testing | No integration tests for auth API endpoints | `apps/api/src/auth/` | Add integration tests (supertest or NestJS TestingModule with real HTTP) for register, login, refresh, logout flows |
| WARNING | Security | CORS configured with `origin: true` reflects any requesting origin | `apps/api/src/main.ts:14` | Replace with explicit allowlist (`origin: [process.env.WEB_URL]`) before staging deployment |
| INFO | Architecture | RedisModule is `@Global()` — acceptable for now but monitor scope creep | `apps/api/src/redis/redis.module.ts:4` | Consider removing @Global if Redis is only used by auth; re-evaluate when more modules consume it |

**Verdict:** APPROVED WITH WARNINGS

---

### P1-T09 — Sentry Error Tracking Setup (web + API)

**Status:** NO EVIDENCE — no commits, task remains `pending`

---

### P1-T17 — KaTeX Integration — Web Math Rendering

**Status:** NO EVIDENCE — no commits, task remains `pending`

---

### P1-T11 — Auth Module — Student Login & RBAC enforcement

**Status:** NO EVIDENCE — no commits, task remains `pending` (depends on P1-T10 which is now done)

---

### P1-T14 — MongoDB Problem Document Schema & API

**Status:** NO EVIDENCE — no commits, task remains `pending`

---

### P1-T12 — User Module — Parent-Child Linking & School Association

**Status:** NO EVIDENCE — no commits, task remains `pending` (depends on P1-T10 done + P1-T11)

---

### P1-T13 — Auth Frontend — Login & Registration Pages

**Status:** NO EVIDENCE — no commits, task remains `pending` (depends on P1-T10, P1-T11)

---

### P1-T15 — Admin CMS for Problem Authoring

**Status:** NO EVIDENCE — no commits, task remains `pending` (stretch goal, depends on P1-T14)

---

## Blockers for Next Sprint
None. The two WARNING findings for P1-T10 are non-blocking.

## Architecture Drift
- **CORS permissiveness** (`origin: true`) is acceptable for local development but must be locked down before any staging/production deployment. This is not yet architecture drift but should be tracked as a pre-deployment checklist item.
- **No architecture drift detected** — Auth module correctly follows NestJS modular monolith, Prisma ORM for writes, Redis for token revocation, Auth0 for identity.

## Positive Observations
1. **Clean Auth0 service abstraction** — `Auth0ClientService` encapsulates all Auth0 Management + Authentication API calls with consistent error mapping (409 -> ConflictException, 401 -> UnauthorizedException). Well-designed boundary.
2. **Refresh token security** — SHA-256 hashing before storage, Redis-backed revocation list with TTL, cookie-based transport (httpOnly, sameSite strict, secure in prod). This is a strong implementation for MVP.
3. **Teacher registration atomicity** — Uses Prisma `$transaction` to create user + school + schoolTeacher linkage atomically. No partial state on failure.
4. **AbortSignal.timeout** on all external HTTP calls (10s). Prevents hanging requests from degrading the service.
5. **Comprehensive DTO validation** — class-validator decorators with `whitelist: true, forbidNonWhitelisted: true` on the global pipe. Prevents mass-assignment attacks.
6. **49 unit tests with good coverage** — covers happy paths, error paths, edge cases (no cookie, revoked token, duplicate email). Test structure is clean with proper mock isolation.

## Recommended Actions for PM Agent
1. Add "Auth API integration tests" task to Sprint 04 backlog — estimated 1 day. Cover register → login → refresh → logout flow with supertest.
2. Add "CORS origin allowlist" to pre-deployment checklist or Sprint 04 — estimated 0.25 days.
3. Sprint velocity note: only 1 of 8 active tasks completed in Sprint 03 (P1-T10). P1-T11, P1-T14 are critical path — prioritize in remaining sprint days.
4. P1-T10 unblocks P1-T11 (student login) and P1-T12 (parent-child linking) — implementation agent should pick up P1-T11 immediately.
