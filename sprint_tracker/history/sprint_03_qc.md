# QC Report — Sprint 03 — 2026-04-25

## Summary
- Tasks reviewed: 1 (P1-T10 — only task marked `done` this sprint)
- Tasks passing all criteria: 0
- Tasks with findings: 1 (warnings only, no blockers)
- Blockers (must fix before next sprint): 0

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration endpoints

**Status:** PASS (with warnings)

**Acceptance Criteria Verification:**

| AC | Criterion | Verdict |
|---|---|---|
| 1 | POST `/auth/register` creates parent/teacher account | PASS — separate `register/parent` and `register/teacher` endpoints both create Auth0 user + Prisma record |
| 2 | POST `/auth/login` returns JWT + sets refresh cookie | PASS — httpOnly cookie with `sameSite: 'strict'`, 7-day maxAge, scoped to `/api/auth` |
| 3 | POST `/auth/refresh` rotates tokens | PASS — checks Redis revocation list, exchanges via Auth0, revokes old token on rotation |
| 4 | POST `/auth/logout` revokes refresh token in Redis | PASS — parallel revocation in Redis + Auth0, clears cookie |
| 5 | Auth0 consent recorded | PASS — `app_metadata` with role passed to Auth0 on user creation |
| 6 | Unit tests for all endpoints | PASS — 56 unit tests across AuthService, AuthController, Auth0ClientService, and RedisService |
| 7 | 401 returned on expired/invalid tokens | PASS — JwtAuthGuard rejects invalid JWTs; refresh endpoint rejects revoked tokens; login rejects bad credentials |

**Findings:**

| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Testing | No integration tests (supertest/e2e) for auth endpoints | `apps/api/src/auth/` | Add supertest integration tests exercising full HTTP stack (middleware, ValidationPipe, guards). Unit tests cover service logic but don't verify the wired-up endpoint behavior. Add to Sprint 04 backlog (~1 day). |
| WARNING | COPPA/Privacy | PII fields (email in User model) lack at-rest encryption | `prisma/schema.prisma` | Plan Prisma middleware or field-level encryption extension for email and other PII. Required for COPPA "reasonable security measures" at production launch. Not a blocker for dev/MVP phase but must be addressed before Phase 2 user onboarding. |
| INFO | Security | CORS allows all origins (`origin: true` in `main.ts:14`) | `apps/api/src/main.ts:14` | Acceptable for local development. Must be restricted to known domains before staging/production deployment. |
| INFO | Architecture | Type cast for Auth0 custom claims namespace | `apps/api/src/auth/strategies/jwt.strategy.ts:42` | `(payload as unknown as Record<string, unknown>)` is justified by Auth0's custom namespace pattern — not a code smell, just documenting for awareness. |

**Verdict:** APPROVED WITH WARNINGS

---

## Blockers for Next Sprint

None. All findings are WARNING or INFO severity.

## Architecture Drift

None detected. The implementation correctly follows the NestJS modular monolith pattern:
- AuthModule encapsulates controller, service, strategy, and guards with clean exports
- RedisModule is `@Global()` and injected via DI — no direct imports
- All database writes go through Prisma ORM (no raw SQL)
- No `setTimeout`/`setInterval` for async work
- Teacher registration uses `prisma.$transaction` for atomicity

## Positive Observations

1. **Refresh token security** — SHA-256 hashing of refresh tokens before Redis storage (`auth.service.ts:282`) is best-practice; tokens are never stored in plaintext
2. **Auth0 client isolation** — `Auth0ClientService` cleanly separates Auth0 HTTP interactions from business logic, with management token caching and 10-second `AbortSignal.timeout` on every external call
3. **Input validation** — DTOs use `class-validator` decorators; global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strips unknown fields and rejects unexpected properties
4. **Cookie security** — Refresh token cookie is `httpOnly`, `sameSite: 'strict'`, scoped to `/api/auth`, and `secure` in production
5. **COPPA-aware design** — `AuthenticatedUser.email` is optional (`email?: string`), student accounts return no email in `/auth/me`, registration endpoints are parent/teacher only
6. **Transaction usage** — Teacher registration creates user + school + schoolTeacher link in a single Prisma transaction, preventing partial-write orphans
7. **Comprehensive test coverage** — 56 new unit tests with good edge case coverage (conflict errors, missing tokens, revoked tokens, graceful logout without cookie)

## Recommended Actions for PM Agent

1. Add "Auth integration tests (supertest)" task to Sprint 04 backlog — estimated 1 day
2. Add "PII at-rest encryption middleware" task to Sprint 05 or Phase 2 backlog — estimated 1.5 days
3. Add "CORS origin allowlist" task to pre-staging hardening checklist — estimated 0.5 days
