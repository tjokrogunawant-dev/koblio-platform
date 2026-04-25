# QC Report — Sprint 03 — 2026-04-25

## Summary
- Tasks reviewed: 8
- Tasks passing all criteria: 0
- Tasks with findings: 1 (P1-T10)
- Tasks with no evidence: 7 (all still pending)
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Status:** PASS (all 7 acceptance criteria met)

**Acceptance Criteria Verification:**
| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | POST `/auth/register` creates parent/teacher account | PASS | `auth.controller.ts:57-97` — separate `/register/parent` and `/register/teacher` endpoints with Auth0 + Prisma user creation |
| 2 | POST `/auth/login` returns JWT + sets refresh cookie | PASS | `auth.controller.ts:99-116` — httpOnly cookie with `sameSite:'strict'`, `secure` in production |
| 3 | POST `/auth/refresh` rotates tokens | PASS | `auth.service.ts:226-251` — old token added to revocation list when rotation occurs |
| 4 | POST `/auth/logout` revokes refresh token in Redis | PASS | `auth.service.ts:253-264` — parallel revocation in Redis + Auth0, cookie cleared |
| 5 | Auth0 consent recorded | PASS | `auth0-client.service.ts:94-132` — `app_metadata` with role set on Auth0 user creation |
| 6 | Unit tests for all endpoints | PASS | 4 test files: `auth.service.spec.ts` (14 tests), `auth.controller.spec.ts` (12 tests), `auth0-client.service.spec.ts` (8 tests), `redis.service.spec.ts` (5 tests) — 56+ total |
| 7 | 401 returned on expired/invalid tokens | PASS | `auth.service.ts:233-234` (revoked refresh), `auth0-client.service.ts:153-155` (bad credentials) |

**Findings:**
| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Testing | No integration tests — only unit tests with mocks; no actual HTTP-level endpoint tests | `apps/api/src/auth/*.spec.ts` | Add supertest integration tests for register/login/refresh/logout endpoints in Sprint 04 |
| WARNING | Testing | No E2E tests (Playwright) for auth flows | — | Deferred until P1-T13 (Auth Frontend) delivers UI; add E2E task to Sprint 04+ |
| WARNING | Security | CORS configured with `origin: true` — reflects any origin for credentialed requests | `apps/api/src/main.ts:14` | Make CORS origin configurable via `CORS_ORIGIN` env var; restrict to Koblio domains before production. Mitigated now by `sameSite:'strict'` on cookies. |
| WARNING | COPPA/Privacy | No field-level encryption on PII columns (`email` in `users`, `ip_address` in `parental_consents`) | `apps/api/prisma/schema.prisma:25,123` | Plan for Prisma field encryption middleware or rely on AWS RDS TDE before production launch. Not blocking for local dev. |
| INFO | Security | Global rate limit is 60 req/60s — auth endpoints (login, register) should have stricter per-endpoint throttling to mitigate credential stuffing | `apps/api/src/app.module.ts:21` | Add `@Throttle({ default: { ttl: 60000, limit: 5 } })` decorator on login/register endpoints |
| INFO | Code Quality | Password validation only enforces `MinLength(8)` — no complexity requirements on API side | `apps/api/src/auth/dto/register-parent.dto.ts:15` | Auth0 enforces password policy server-side, so this is defense-in-depth only; consider adding `@Matches` regex for client-side feedback |

**Verdict:** APPROVED WITH WARNINGS

---

### P1-T09 — Sentry Error Tracking Setup

**Status:** NO EVIDENCE — task is `pending`, no commits found.

---

### P1-T17 — KaTeX Integration — Web Math Rendering

**Status:** NO EVIDENCE — task is `pending`, no commits found.

---

### P1-T11 — Auth Module — Student Login & RBAC enforcement

**Status:** NO EVIDENCE — task is `pending`, depends on P1-T10 (now done). Ready to start.

---

### P1-T14 — MongoDB Problem Document Schema & API

**Status:** NO EVIDENCE — task is `pending`, awaiting Atlas connection setup.

---

### P1-T12 — User Module — Parent-Child Linking & School Association

**Status:** NO EVIDENCE — task is `pending`, depends on P1-T10 (done) and P1-T11.

---

### P1-T13 — Auth Frontend — Login & Registration Pages

**Status:** NO EVIDENCE — task is `pending`, depends on P1-T10 and P1-T11.

---

### P1-T15 — Admin CMS for Problem Authoring

**Status:** NO EVIDENCE — stretch goal, depends on P1-T14. Not expected this sprint.

---

## Blockers for Next Sprint
None. All findings are WARNING or INFO severity.

## Architecture Drift
- **CORS origin policy** (`origin: true`) must be tightened before any staging/production deployment. Currently acceptable for local development.
- **No PII field encryption** — the QC checklist calls for `@Encrypted` or equivalent at-rest protection on PII fields. Not yet implemented. Acceptable for Phase 1 local dev, but must be addressed before production (Phase 3+ AWS deployment with RDS TDE or Prisma field encryption middleware).

## Positive Observations
1. **Strong token security model:** SHA-256 hashed refresh tokens in Redis (never plaintext), httpOnly + secure + sameSite:strict cookies, token rotation with old-token revocation — exceeds typical MVP security posture.
2. **Clean NestJS architecture:** Auth module properly encapsulated with service injection, global guards (JWT + Roles + Throttler) registered via `APP_GUARD`, no cross-module leaks.
3. **Prisma $transaction for teacher registration:** Teacher + School + SchoolTeacher created atomically — prevents orphan records on failure.
4. **Comprehensive unit test coverage:** 56+ tests across 4 files covering happy paths, error paths, edge cases (missing cookies, revoked tokens, duplicate emails).
5. **Auth0 integration done right:** JWKS-based RS256 validation via `passport-jwt` + `jwks-rsa`, management token caching with TTL, `AbortSignal.timeout(10_000)` on all external HTTP calls.
6. **COPPA-aware schema design:** Student `email` is nullable, `ParentalConsent` model with consent versioning and IP logging already in schema.

## Recommended Actions for PM Agent
1. Add "Auth integration tests (supertest)" task to Sprint 04 backlog — estimated 1 day
2. Add "CORS origin env configuration" task to Sprint 04 backlog — estimated 0.25 days
3. Add "Auth endpoint rate limiting (per-endpoint throttle)" task to Sprint 04 backlog — estimated 0.25 days
4. P1-T11 (Student Login & RBAC) is unblocked — prioritize as next backend task
5. Track PII encryption as a Phase 3 pre-production requirement (not urgent for local dev)
