# QC Report — Sprint 03 — 2026-04-24

## Summary
- Tasks reviewed: 1 (P1-T10 — done)
- Tasks passing all criteria: 1 (with warnings)
- Tasks with findings: 1
- Blockers (must fix before next sprint): 0
- Pending tasks not reviewed (no commits): 7 (P1-T09, P1-T11, P1-T12, P1-T13, P1-T14, P1-T15, P1-T17)

---

## Findings

### P1-T10 — Auth Module: Parent & Teacher Registration Endpoints

**Status:** DONE (commit `acabf47`)

**Acceptance Criteria Check:**
| Criterion | Met? |
|---|---|
| POST `/auth/register` creates parent/teacher account | YES — `/auth/register/parent` and `/auth/register/teacher` |
| POST `/auth/login` returns JWT + sets refresh cookie | YES — httpOnly cookie with 7d TTL |
| POST `/auth/refresh` rotates tokens | YES — old token revoked, new token issued |
| POST `/auth/logout` revokes refresh token in Redis | YES — parallel Redis + Auth0 revocation |
| Auth0 consent recorded | YES — app_metadata with role set on user creation |
| Unit tests for all endpoints | YES — 56+ unit tests across 7 spec files |
| 401 returned on expired/invalid tokens | YES — tested in service and controller specs |

**Findings:**
| Severity | Category | Finding | File:Line | Recommendation |
|---|---|---|---|---|
| WARNING | Security | CORS `origin: true` accepts all origins with `credentials: true` | `apps/api/src/main.ts:14` | Before production deploy, restrict to explicit allowed origins (e.g., `['https://app.koblio.com']`). Acceptable for local dev but must not ship to production. |
| WARNING | Testing | No integration tests (supertest) for auth API endpoints | `apps/api/src/auth/` | Unit tests with mocked deps are thorough but don't test real HTTP layer. Add supertest integration tests in a future sprint. |
| INFO | Code Quality | Double cast `as unknown as Record<string, unknown>` for Auth0 namespaced claims | `apps/api/src/auth/strategies/jwt.strategy.ts:42` | Justified by Auth0's custom namespace pattern. Consider a typed helper if more namespaced claims are added. |
| INFO | Code Quality | DTO password validation is `@MinLength(8)` only — no complexity enforcement | `apps/api/src/auth/dto/register-parent.dto.ts:16` | Auth0 likely enforces complexity server-side. Consider adding `@Matches` regex for defense-in-depth. |

**Verdict:** APPROVED WITH WARNINGS

---

### Pending Tasks — NO EVIDENCE

The following tasks are listed as `pending` in `sprint_tracker/current_sprint.md` with no associated commits. They are not reviewed.

| Task ID | Title | Status |
|---|---|---|
| P1-T09 | Sentry Error Tracking Setup (web + API) | NO EVIDENCE |
| P1-T11 | Auth Module — Student Login & RBAC enforcement | NO EVIDENCE |
| P1-T12 | User Module — Parent-Child Linking & School Association | NO EVIDENCE |
| P1-T13 | Auth Frontend — Login & Registration Pages | NO EVIDENCE |
| P1-T14 | MongoDB Problem Document Schema & API | NO EVIDENCE |
| P1-T15 | Admin CMS for Problem Authoring | NO EVIDENCE |
| P1-T17 | KaTeX Integration — Web Math Rendering | NO EVIDENCE |

---

## Blockers for Next Sprint

None. No BLOCKER-severity findings this sprint.

---

## Architecture Drift

No architecture drift detected. The auth module follows NestJS modular monolith conventions correctly:
- Services injected via constructor DI, no cross-module direct imports
- All database writes go through Prisma ORM (parameterized)
- Redis access encapsulated in a `@Global()` RedisModule/RedisService
- Guards registered as global APP_GUARD providers in AppModule
- JWT validation via JWKS (RS256, no local secret) — correct Auth0 integration pattern

---

## Positive Observations

1. **SHA-256 hashed refresh tokens** — Tokens stored in Redis are hashed, never plaintext. Excellent security practice that exceeds typical MVP requirements.
2. **Token rotation with revocation** — On refresh, old tokens are added to a Redis revocation list with TTL. Proper defense against token replay.
3. **COPPA-aware design** — Student accounts have no email field, `isStudentAccount()` helper exists, `getMe` endpoint returns `undefined` email for students, JWT strategy test explicitly verifies COPPA compliance.
4. **Transactional teacher registration** — User + School + SchoolTeacher created in a single `$transaction`, preventing orphaned records on partial failure.
5. **Proper error handling at Auth0 boundary** — `AbortSignal.timeout(10_000)` on all fetch calls, specific HTTP status code mapping (409 → ConflictException, 401/403 → UnauthorizedException, 5xx → InternalServerErrorException).
6. **Comprehensive test coverage** — 7 spec files covering controller, service, Auth0 client, Redis service, JWT strategy, JWT guard, and Roles guard. Edge cases tested (missing cookies, revoked tokens, duplicate emails).

---

## Recommended Actions for PM Agent

1. Add "Restrict CORS origins for production" task to pre-deploy checklist — estimated 0.5 days
2. Add "Integration tests (supertest) for auth endpoints" task to Sprint 04 or 05 backlog — estimated 1 day
3. Sprint 03 is mid-sprint with only 1 of 8 tasks completed; PM should assess velocity risk and consider trimming scope for sprint end (2026-05-02)
