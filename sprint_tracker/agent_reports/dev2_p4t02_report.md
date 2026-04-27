# P4-T02 — Health Check Endpoint + Deployment Runbook

**Agent:** dev2  
**Date:** 2026-04-27  
**Task:** P4-T02

---

## Summary

Implemented three changes for closed-beta readiness:

1. **Health check endpoint** — upgraded the existing `GET /api/health` stub to perform a live DB connectivity check and return correct HTTP status codes.
2. **CORS hardening** — replaced the wildcard `origin: true` with `process.env.WEB_URL ?? 'http://localhost:3000'`.
3. **Deployment runbook** — created `DEPLOY.md` at the monorepo root with env var tables, Railway deploy steps, Auth0 setup guide, and a pre-beta checklist.

---

## Files Changed

### `apps/api/src/app.service.ts`
- Injected `PrismaService` via constructor.
- `getHealth()` is now `async` and runs `this.prisma.$queryRaw\`SELECT 1\``.
- Returns `{ status: 'ok', timestamp, db: 'ok' }` on success.
- Catches DB errors and returns `{ status: 'error', timestamp, db: 'error' }`.

### `apps/api/src/app.controller.ts`
- `getHealth()` is now `async` and uses `@Res() res: Response` to set the correct HTTP status code.
- Returns **HTTP 200** when DB is reachable; **HTTP 503** when the DB check fails.
- Remains `@Public()` — no JWT required.

### `apps/api/src/main.ts`
- **CORS:** Changed `origin: true` (allow all) to `origin: process.env.WEB_URL ?? 'http://localhost:3000'`.
- **Global prefix:** Removed `{ exclude: ['health'] }` from `setGlobalPrefix('api')` so the endpoint is served at `/api/health` (consistent with Railway's health check path and the pre-beta checklist).

### `DEPLOY.md` (new)
- Full deployment runbook created at the monorepo root.
- Covers: prerequisites, env var tables for API + Web services, first-deploy steps, database migration process, Auth0 setup, and pre-beta checklist.

---

## Design Notes

- The `@Public()` decorator on `getHealth()` short-circuits the global `JwtAuthGuard` (reflector-based bypass via `IS_PUBLIC_KEY`), so no token is needed for the health check.
- The `PrismaModule` is `@Global()`, so `PrismaService` is available for injection in `AppService` without any additional module imports.
- Using `@Res()` (passthrough not needed here) gives full control over the response status code — necessary because NestJS doesn't have a built-in way to conditionally return 200 vs 503 from a decorator.

---

## Acceptance Criteria Status

| Criterion | Status |
|---|---|
| `GET /api/health` returns HTTP 200 + `{ status: 'ok', timestamp, db: 'ok' }` | Done |
| DB connectivity checked via `SELECT 1` | Done |
| Returns HTTP 503 + `{ status: 'error', db: 'error', timestamp }` on DB failure | Done |
| Route is `@Public()` (no JWT required) | Done |
| CORS restricted to `WEB_URL` env var | Done |
| `DEPLOY.md` runbook at monorepo root | Done |
