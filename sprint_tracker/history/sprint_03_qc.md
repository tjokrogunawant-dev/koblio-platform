# QC Report — Sprint 03 — 2026-04-26

## Summary
- Tasks reviewed: 1 (only P1-T10 marked `done`; 7 tasks still `pending`)
- Tasks passing all criteria: 0
- Tasks with findings: 1
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Status:** PASS (with warnings)

**Commit:** `acabf47`

**Acceptance Criteria Check:**

| AC | Met? | Notes |
|---|---|---|
| POST `/auth/register` creates parent/teacher account | YES | Separate `/register/parent` and `/register/teacher` endpoints |
| POST `/auth/login` returns JWT + sets refresh cookie | YES | httpOnly cookie with 7-day TTL |
| POST `/auth/refresh` rotates tokens | YES | Revokes old token hash on rotation |
| POST `/auth/logout` revokes refresh token in Redis | YES | Dual revocation: Redis + Auth0 |
| Auth0 consent recorded | YES | `app_metadata` set on Auth0 user creation |
| Unit tests for all endpoints | YES | 4 spec files: controller, service, auth0-client, redis |
| 401 returned on expired/invalid tokens | YES | Via Passport JwtAuthGuard + Auth0 validation |

**Findings:**

| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Security | CORS allows all origins with credentials (`origin: true`). Any domain can make authenticated requests in production. | `apps/api/src/main.ts:14` | Replace `origin: true` with a `CORS_ORIGIN` env var whitelist before deployment. |
| WARNING | Testing | No integration/E2E tests for the 5 new API endpoints (`/register/parent`, `/register/teacher`, `/login`, `/refresh`, `/logout`). Unit tests mock all dependencies, so wiring issues would not be caught. | — | Add Supertest-based integration tests in Sprint 04. |
| WARNING | Data Consistency | If Auth0 user creation succeeds but Prisma `user.create` fails, an orphaned Auth0 account remains with no local record. No compensating rollback. | `apps/api/src/auth/auth.service.ts:57-75` | Wrap in try/catch; delete Auth0 user on Prisma failure, or add a reconciliation job. |
| WARNING | COPPA/Privacy | Email field in Prisma schema stored as plain `String` with no at-rest encryption. PII protection required for child-facing platform. | `schema.prisma` (User model) | Add Prisma middleware or field-level encryption for PII fields before Phase 1 gate. |
| INFO | Security | Refresh cookie `secure` flag is `false` outside production (`process.env.NODE_ENV === 'production'`). Expected for local dev, but ensure `NODE_ENV=production` is set in all deployed environments. | `apps/api/src/auth/auth.controller.ts:33` | Document in deployment runbook. |

**Verdict:** APPROVED WITH WARNINGS

---

## Pending Tasks (not reviewed — no commits)

| Task ID | Title | Status |
|---|---|---|
| P1-T09 | Sentry Error Tracking Setup | pending |
| P1-T17 | KaTeX Integration — Web Math Rendering | pending |
| P1-T11 | Auth Module — Student Login & RBAC | pending |
| P1-T14 | MongoDB Problem Document Schema & API | pending |
| P1-T12 | User Module — Parent-Child Linking & School Association | pending |
| P1-T13 | Auth Frontend — Login & Registration Pages | pending |
| P1-T15 | Admin CMS for Problem Authoring | pending |

---

## Blockers for Next Sprint
None. All findings are WARNING or INFO severity.

## Architecture Drift
- **CORS permissiveness**: `origin: true` with `credentials: true` deviates from production security posture. Must be tightened before any public deployment.
- **PII at-rest encryption**: The platform spec (`koobits_legal_compliance_package.md`) requires encrypted PII fields. The Prisma schema currently stores email as plaintext. This predates Sprint 03 (established in P1-T05) but becomes critical as auth endpoints now write user PII through this path.

## Positive Observations
- **SHA-256 hashed refresh tokens**: Tokens are never stored in plaintext in Redis — proper security hygiene.
- **Token rotation with revocation**: Old refresh tokens are added to the revocation list on rotation, preventing replay attacks.
- **Transactional teacher registration**: User + school + school-teacher link created atomically via `$transaction`.
- **Clean NestJS module architecture**: AuthModule, RedisModule (`@Global`), and Auth0ClientService are properly separated with dependency injection — no cross-module direct imports.
- **Comprehensive unit test coverage**: 4 spec files with 56+ tests covering happy paths, error cases, and edge cases (e.g., missing refresh cookie, revoked tokens).
- **COPPA-aware student DTOs**: `StudentLoginDto` and `ClassCodeLoginDto` correctly avoid email collection for under-13 users.
- **ConfigService for all secrets**: No hardcoded credentials anywhere — Auth0 domain, client ID, client secret, and audience all loaded from environment.
- **Proper Auth0 RBAC integration**: JWKS-based RS256 validation, custom claims namespace support, and role assignment via Management API.

## Recommended Actions for PM Agent
1. Add "CORS origin whitelist" task to Sprint 04 backlog — estimated 0.25 days.
2. Add "Auth endpoint integration tests (Supertest)" task to Sprint 04 backlog — estimated 1 day.
3. Add "Auth0 user rollback on Prisma failure" task to Sprint 04 backlog — estimated 0.5 days.
4. Track PII encryption as a Phase 1 gate requirement — must be resolved before P1-T33 (UAT/launch readiness).
