# QC Report — Sprint 03 — 2026-04-23

## Summary
- Tasks reviewed: 1
- Tasks passing all criteria: 0
- Tasks with findings: 1
- Blockers (must fix before next sprint): 0

> Only task P1-T10 is marked `done` this sprint. All other tasks (P1-T09, P1-T11, P1-T12, P1-T13, P1-T14, P1-T15, P1-T17) remain `pending` and are not reviewed.

## Findings

### P1-T10 — Auth Module — Parent & Teacher Registration Endpoints

**Commit:** `acabf47` (2026-04-22)  
**Status:** PARTIAL

**Checklist Results:**

| Area | Item | Result |
|------|------|--------|
| Code Quality | No TODO/FIXME in deliverable code paths | PASS |
| Code Quality | No `any` types without justification | PASS |
| Code Quality | No hardcoded credentials/API keys | PASS |
| Code Quality | Error handling at system boundaries | PASS |
| Code Quality | Parameterized queries (no injection vectors) | PASS |
| Testing | Unit tests for business logic | PASS (49 tests across 4 spec files) |
| Testing | Integration tests for API endpoints | FAIL — none found |
| Testing | E2E tests for user-facing flows | N/A — no frontend auth pages yet (P1-T13 pending) |
| Architecture | NestJS modular monolith pattern | PASS |
| Architecture | DB writes via Prisma ORM | PASS |
| Architecture | No setTimeout/setInterval for async work | PASS |
| COPPA/Privacy | No email collection from under-13 | PASS — StudentLoginDto uses username, not email |
| COPPA/Privacy | Session tokens are httpOnly cookies | PASS — sameSite: strict, path-scoped |

**Findings:**

| Severity | Category | Finding | File:Line | Recommendation |
|----------|----------|---------|-----------|----------------|
| WARNING | Security | CORS `origin: true` accepts all origins | `apps/api/src/main.ts:14` | Replace with explicit allowlist (e.g. `['http://localhost:3000', process.env.WEB_URL]`) before any non-local deployment |
| WARNING | Testing | No integration tests (supertest) for auth API endpoints | `apps/api/src/auth/` | Add supertest-based integration tests covering register, login, refresh, logout HTTP flows |
| INFO | Code Quality | `Auth0UserResponse` uses `[key: string]: unknown` index signature | `apps/api/src/auth/auth0-client.service.ts:23` | Tighten to known Auth0 response fields when stable |

**Verdict:** APPROVED WITH WARNINGS

---

## Blockers for Next Sprint
None. All findings are WARNING or INFO severity.

## Architecture Drift
- **CORS configuration** (`origin: true` in `main.ts:14`): Acceptable for local development but must be locked down before staging/production. Add a task to restrict CORS origins as part of deployment hardening (P1-T03 Terraform / infra task or a dedicated security hardening ticket).
- No other architecture drift detected. The auth module follows NestJS modular monolith conventions correctly: proper service injection, `@Global()` RedisModule, Passport strategy pattern, decorator-based RBAC guards.

## Positive Observations
1. **SHA-256 hashed refresh tokens** stored in Redis — never plaintext. Excellent security practice.
2. **Token rotation with old-token revocation** in the refresh flow prevents replay attacks.
3. **Teacher registration uses Prisma `$transaction`** for atomic creation of user + school + schoolTeacher records. Proper rollback semantics.
4. **Auth0 management token caching** with 60-second pre-expiry buffer avoids unnecessary token fetches.
5. **Clean service separation**: `Auth0ClientService` wraps external API calls with timeouts; `AuthService` owns business logic. No cross-concerns leaking.
6. **10-second `AbortSignal.timeout`** on every Auth0 API call — prevents hung connections from blocking the event loop.
7. **COPPA-aware design**: `StudentLoginDto` has no email field, `isStudentAccount` helper already distinguishes student accounts by absence of email. Login DTO discriminated union (`email | student | class_code`) ready for P1-T11.
8. **Comprehensive unit test coverage**: 49 tests covering happy paths, error paths, edge cases (no refresh cookie, revoked token, duplicate email, missing Prisma user, Auth0 failures).

## Recommended Actions for PM Agent
1. Add "Auth API integration tests (supertest)" task to Sprint 04 backlog — estimated 1 day. Should cover full HTTP round-trips for register, login, refresh, logout.
2. Add "CORS origin allowlist" hardening task — estimated 0.5 days. Must be completed before any non-localhost deployment.
3. When P1-T13 (Auth Frontend) lands, ensure E2E Playwright tests cover the registration and login flows end-to-end.
