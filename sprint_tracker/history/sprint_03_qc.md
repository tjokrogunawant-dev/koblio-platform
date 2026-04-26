# QC Report — Sprint 03 — 2026-04-26

## Summary
- Tasks reviewed: 1 (P1-T10 — only task marked `done` this sprint)
- Tasks passing all criteria: 0
- Tasks with findings: 1
- Blockers (must fix before next sprint): 0

Remaining Sprint 03 tasks (P1-T09, P1-T11, P1-T12, P1-T13, P1-T14, P1-T15, P1-T17) are all status `pending` — not yet started, not reviewed.

---

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Commit:** `acabf47`
**Status:** PARTIAL

**Acceptance Criteria Verification:**

| Criterion | Met? | Evidence |
|---|---|---|
| POST `/auth/register` creates parent/teacher account | YES | `POST /auth/register/parent` and `POST /auth/register/teacher` in `auth.controller.ts:57,85` |
| POST `/auth/login` returns JWT + sets refresh cookie | YES | `auth.controller.ts:99` — returns `access_token` + sets `koblio_refresh` httpOnly cookie |
| POST `/auth/refresh` rotates tokens | YES | `auth.controller.ts:118` — reads cookie, calls Auth0 refresh, sets new cookie on rotation |
| POST `/auth/logout` revokes refresh token in Redis | YES | `auth.controller.ts:149` — revokes in Redis + Auth0, clears cookie |
| Auth0 consent recorded | PARTIAL | Registration is parent-initiated (correct for COPPA), but no explicit consent timestamp/IP recorded in DB |
| Unit tests for all endpoints | YES | 56 unit tests across 4 spec files (auth.service, auth.controller, auth0-client.service, redis.service) |
| 401 returned on expired/invalid tokens | YES | Tested in `auth.service.spec.ts:294-300`, `auth.controller.spec.ts:194-204` |

**Findings:**

| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Security | CORS allows all origins with credentials (`origin: true, credentials: true`). Any website can make credentialed requests to the API. | `apps/api/src/main.ts:14` | Restrict `origin` to explicit allowlist (`['http://localhost:3000']` for dev, production domains for prod) before any public deployment. |
| WARNING | Data Consistency | Auth0 user created before Prisma record. If Prisma `user.create` or `$transaction` fails, an orphaned Auth0 account exists with no local record and no cleanup. | `apps/api/src/auth/auth.service.ts:57-75` (parent), `:118-154` (teacher) | Wrap the full flow in a try/catch that calls `auth0Client.deleteUser()` on Prisma failure, or create Prisma record first and Auth0 second. |
| WARNING | Testing | No integration tests exercising the full HTTP pipeline (middleware, guards, validation pipes, cookie handling) via supertest. Unit tests mock all dependencies so pipeline-level bugs (e.g., missing `cookieParser()`, DTO validation rejection) are invisible. | `apps/api/src/auth/` | Add at least 5 integration tests using `@nestjs/testing` + supertest for the happy path of each endpoint. |
| WARNING | COPPA | No explicit parental consent record with timestamp + IP stored during registration. The spec (`koobits_legal_compliance_package.md` §2.4, §7) requires a `consent_records` table entry when a parent creates an account. | `apps/api/src/auth/auth.service.ts:46-105` | Add consent record creation to `registerParent()` — store `{ user_id, consent_type, ip_address, timestamp, version }`. This is prerequisite for P1-T12 parent-child linking. |
| WARNING | COPPA | PII fields (email) stored without `@Encrypted` decorator or field-level encryption. At-rest protection required per compliance spec. | `apps/api/src/auth/auth.service.ts:69` (Prisma create) | Implement Prisma middleware or field-level encryption for email columns before production. Acceptable for local dev. |
| INFO | Architecture | `RedisModule` is `@Global()` which makes `RedisService` available to all modules without explicit import. Acceptable for infrastructure services but should not become a pattern for domain modules. | `apps/api/src/redis/redis.module.ts:4` | No action needed now. Document this as an intentional infrastructure exception. |
| INFO | Code Quality | `setRefreshCookie` and `clearRefreshCookie` are module-level functions in the controller file rather than extracted to a utility. Minor, but they'll be reused when P1-T11 (student login) is built. | `apps/api/src/auth/auth.controller.ts:31-43` | Consider extracting to a shared cookie utility when P1-T11 is implemented. |

**Verdict:** APPROVED WITH WARNINGS

The core auth flow is solid: credentials via ConfigService (no hardcoded secrets), SHA-256 hashed refresh tokens in Redis, httpOnly/strict cookies, proper Auth0 Management + Authentication API integration, class-validator DTOs with whitelist/forbidNonWhitelisted, and comprehensive unit tests. The warnings are real but none are blocking for the current development phase.

---

## Blockers for Next Sprint
None. All findings are WARNING or INFO severity.

## Architecture Drift
- **CORS wildcard** — `origin: true` is a development shortcut that must be replaced with an explicit allowlist before any staging or production deployment. Track this as a pre-deployment checklist item.
- **No consent record storage** — The compliance spec requires consent records at registration time. This gap should be closed in P1-T12 (Parent-Child Linking) at the latest, since that task explicitly requires "consent record stored with timestamp+IP" as an acceptance criterion.

## Positive Observations
1. **Clean separation of concerns** — Auth0 API calls isolated in `Auth0ClientService`, Redis operations in `RedisService`, business logic in `AuthService`, HTTP concerns in `AuthController`. Each is independently testable.
2. **Strong token security** — Refresh tokens are SHA-256 hashed before Redis storage, never stored in plaintext. Revocation list uses TTL-based expiry matching token lifetime. Token rotation revokes the old token.
3. **Comprehensive unit tests** — 56 tests covering happy paths, error paths (duplicate email, bad credentials, revoked tokens, missing cookies), and edge cases (logout without token, student account detection). Good coverage of the Auth0ClientService HTTP layer including 409/401/500 responses.
4. **Proper NestJS patterns** — Global `ValidationPipe` with `whitelist: true` + `forbidNonWhitelisted: true` prevents mass assignment. DTOs use class-validator decorators. Swagger decorators on all endpoints.
5. **Teacher registration uses Prisma `$transaction`** — User + school + schoolTeacher created atomically. Good data integrity practice.

## Recommended Actions for PM Agent
1. Add "CORS origin allowlist" task to pre-deployment checklist — estimated 0.5 days.
2. Add "Parental consent record storage" to P1-T12 scope (already partially in its AC) — ensure it includes IP + timestamp + consent version. Estimated 0.5 days.
3. Add "Auth integration tests (supertest)" task to Sprint 04 backlog — estimated 1 day.
4. Add "Auth0 orphan cleanup on registration failure" task to Sprint 04 backlog — estimated 0.5 days.
5. Add "PII field-level encryption via Prisma middleware" task to pre-deployment checklist — estimated 1 day.
