# QC Report — Sprint 03 — 2026-04-24

## Summary
- Tasks reviewed: 1
- Tasks passing all criteria: 0
- Tasks with findings: 1 (all warnings, no blockers)
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Status:** DONE (commit `acabf47`)

**Acceptance Criteria Check:**
| # | Criterion | Met? |
|---|---|---|
| 1 | POST `/auth/register/parent` creates parent account | YES |
| 2 | POST `/auth/register/teacher` creates teacher account | YES |
| 3 | POST `/auth/login` returns JWT + sets httpOnly refresh cookie | YES |
| 4 | POST `/auth/refresh` rotates tokens | YES |
| 5 | POST `/auth/logout` revokes refresh token in Redis | YES |
| 6 | Auth0 consent recorded | YES (via Auth0 built-in consent) |
| 7 | Unit tests for all endpoints | YES (56 new tests, 104 total, 0 regressions) |
| 8 | 401 returned on expired/invalid tokens | YES |

**Findings:**
| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Testing | No integration/E2E tests for the 5 new API endpoints — only unit tests with fully mocked dependencies | `apps/api/src/auth/` | Add at least one integration test per endpoint (using supertest against a real NestJS app instance) in Sprint 04 |
| WARNING | Security | CORS set to `origin: true` (reflects all origins) | `apps/api/src/main.ts:13` | Restrict to explicit allowed origins (`CORS_ORIGIN` env var) before any staging/production deployment |
| WARNING | COPPA/Privacy | No `@Encrypted` decorator or equivalent on `email` field in Prisma schema — PII stored in plaintext at rest | `apps/api/src/auth/auth.service.ts` (Prisma user create) | Add at-rest encryption for PII fields. Currently parent/teacher adult data only (not child data), so WARNING not BLOCKER |
| INFO | Architecture | Teacher registration creates a new school each time — no deduplication by school name | `apps/api/src/auth/auth.service.ts:100-112` | Future consideration: lookup-or-create pattern for schools when P1-T12 parent-child linking adds multi-teacher flows |

**Verdict:** APPROVED WITH WARNINGS

---

### Pending Tasks (not reviewed — no commits, status: pending)

| Task ID | Title | QC Status |
|---|---|---|
| P1-T09 | Sentry Error Tracking Setup (web + API) | NOT IN SCOPE (pending) |
| P1-T17 | KaTeX Integration — Web Math Rendering | NOT IN SCOPE (pending) |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | NOT IN SCOPE (pending) |
| P1-T14 | MongoDB Problem Document Schema & API | NOT IN SCOPE (pending) |
| P1-T12 | User Module — Parent-Child Linking & School Association | NOT IN SCOPE (pending) |
| P1-T13 | Auth Frontend — Login & Registration Pages | NOT IN SCOPE (pending) |
| P1-T15 | Admin CMS for Problem Authoring | NOT IN SCOPE (pending) |

---

## Blockers for Next Sprint
None. All findings are WARNING or INFO severity.

## Architecture Drift
- **CORS permissiveness:** `origin: true` in `main.ts` reflects all origins. This is acceptable during local development but must be locked down before any deployment beyond localhost. Recommend adding `CORS_ORIGIN` environment variable with a whitelist in Sprint 04.
- **No drift detected** in NestJS modular monolith pattern — AuthModule and RedisModule are properly structured with DI, and RedisModule is correctly `@Global`.

## Positive Observations
- **Clean Auth0 abstraction:** `Auth0ClientService` wraps all Auth0 Management and Authentication API calls with 10-second timeouts and proper error mapping (409→ConflictException, 401→UnauthorizedException, 5xx→InternalServerErrorException). This is excellent for testability and future provider swaps.
- **Secure token handling:** Refresh tokens are SHA-256 hashed before Redis storage (never plaintext). Revocation list uses TTL-based expiry matching token lifetime. Token rotation properly revokes old tokens.
- **Transactional integrity:** Teacher registration creates user + school + schoolTeacher link in a single Prisma `$transaction`, preventing orphaned records.
- **Cookie security:** httpOnly, sameSite strict, secure in production, scoped to `/api/auth` path. This is textbook-correct.
- **Comprehensive test coverage:** 4 test files (auth.controller.spec, auth.service.spec, auth0-client.service.spec, redis.service.spec) with 56 new tests covering happy paths, error paths, edge cases (missing cookie, revoked token, duplicate email).
- **Validation pipeline:** DTOs use class-validator decorators with `whitelist: true` and `forbidNonWhitelisted: true` globally, preventing mass-assignment attacks.

## Recommended Actions for PM Agent
1. Add "Auth integration tests (supertest)" task to Sprint 04 backlog — estimated 1 day
2. Add "Restrict CORS origins via environment variable" task to Sprint 04 backlog — estimated 0.5 days
3. Add "PII at-rest encryption for email fields" task to Sprint 04 or 05 backlog — estimated 1 day (coordinate with P1-T12 parent-child linking)
