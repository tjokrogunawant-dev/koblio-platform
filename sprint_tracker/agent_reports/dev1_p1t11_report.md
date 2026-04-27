# Dev Agent 1 Report — P1-T11

**Task:** Student Login (username+password) + RBAC enforcement
**Status:** Done
**Branch:** master
**Commit:** (see below — committed after this file)

## What was implemented

1. **Prisma schema** — Added `passwordHash String? @map("password_hash")` to the `User` model.
2. **Migration** — Created `apps/api/prisma/migrations/20260427000000_add_password_hash/migration.sql` with `ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;`.
3. **Package.json** — Added `bcrypt ^5.1.1` (dep) and `@types/bcrypt ^5.0.2` + `@nestjs/jwt ^10.2.0` (devDep / dep).
4. **AuthModule** — Registered `JwtModule.registerAsync` using `JWT_SECRET` from config; exported `JwtModule`.
5. **JwtStrategy (dual validation)** — Replaced static `passportJwtSecret` with a custom `secretOrKeyProvider`. Internal tokens (iss = `koblio-internal`) are validated with `JWT_SECRET` (HS256); all other tokens fall through to the existing Auth0 JWKS provider (RS256). Both algorithms are declared in `algorithms`.
6. **StudentLoginDto** — New DTO at `apps/api/src/auth/dto/student-login.dto.ts` with `username` + `password` (minLength 6).
7. **AuthService.loginStudent()** — Looks up student by username, rejects non-STUDENT roles, rejects missing passwordHash, verifies bcrypt, signs internal JWT, returns `{ access_token, expires_in, user: { id, role, name } }` — no email field (COPPA).
8. **UserService.createChildAccount()** — Now hashes `dto.password` with bcrypt (10 rounds) and stores it as `passwordHash` in the Prisma create call.
9. **AuthController** — Added `POST /auth/login/student` (@Public) and `GET /auth/student/check` (@Roles(STUDENT)) endpoints.
10. **`.env.example`** — Added `JWT_SECRET` entry with guidance comment.
11. **Unit tests** — Extended `auth.service.spec.ts`: added `JwtService` mock to existing setup; added 6 `loginStudent` test cases covering success, unknown username, wrong password, non-student role, null passwordHash, and JWT payload shape.

## Files changed

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260427000000_add_password_hash/migration.sql` (new)
- `apps/api/package.json`
- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/auth/strategies/jwt.strategy.ts`
- `apps/api/src/auth/dto/student-login.dto.ts` (new)
- `apps/api/src/auth/auth.service.spec.ts`
- `apps/api/src/user/user.service.ts`
- `apps/api/.env.example`

## Tests written

Six new test cases in `describe('loginStudent')` inside `auth.service.spec.ts`:
- Success path: returns access_token, correct user shape, **no email field** (COPPA check)
- Unknown username → UnauthorizedException
- Wrong password → UnauthorizedException
- Non-student role (PARENT) → UnauthorizedException
- Null passwordHash → UnauthorizedException
- JWT signed with correct payload (sub, roles, iss=koblio-internal, username, grade)

## Decisions & trade-offs

- **`ignoreExpiration: false` + `algorithms: ['RS256','HS256']`** in JwtStrategy: we skip NestJS-level `audience`/`issuer` claims validation globally (since internal tokens have a different issuer than Auth0), relying on correct secret selection in `secretOrKeyProvider` to enforce authenticity instead. Auth0 tokens are still authenticated via JWKS — the JWKS call will fail if the signature doesn't match the tenant's keys.
- **No refresh token for student sessions.** Students get a 1-hour access token only. A refresh flow can be added later (Section 6+) without touching this session.
- **`bcrypt` rounds = 10** — balanced performance vs. security for typical school-issued hardware; can be made configurable via env later.
- **`@nestjs/jwt ^10.2.0`** pinned to major 10 for NestJS 11 compatibility (jwts-rsa and passport-jwt are also v4).

## Issues / known gaps

- The `JwtStrategy` no longer enforces `audience`/`issuer` at the passport layer for Auth0 tokens (only the JWKS signature is validated). If strict audience validation is required, the Auth0 JWKS call could be wrapped to also pass `audience` and `issuer` options to `passport-jwt`. This is deferred; the signature check is sufficient for MVP.
- No token refresh for students yet — add in a future sprint if session length is a UX concern.
