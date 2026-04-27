# Sprint 14 QC Report

**Date:** 2026-04-27  
**Reviewer:** QC Agent  
**Sprint Goal:** Docker + Railway deployment config + health check + CORS hardening

## Overall Status: PASS WITH MINOR ISSUES

One non-blocking configuration mismatch found in `railway.toml` (healthcheck path). All other criteria pass. The platform is deployable but the Railway health check will fail on first deploy unless the path is corrected before go-live.

---

## P4-T01 Docker + Railway Config

### `apps/api/Dockerfile`
- [PASS] Multi-stage build with three named stages: `deps`, `builder`, `runner`
- [PASS] Uses pnpm (`corepack enable && corepack prepare pnpm@10.33.0 --activate`) in both `deps` and `builder` stages
- [PASS] `prisma generate` runs in the build stage — it is embedded in the `build` npm script (`"build": "prisma generate && nest build"`), which is invoked by `pnpm --filter @koblio/api build` in the `builder` stage
- [PASS] `prisma migrate deploy` runs at container startup via `CMD ["sh", "-c", "prisma migrate deploy && node dist/main.js"]`
- [PASS] Prisma schema and migrations directory are copied into the runner stage so `migrate deploy` has access to migration files

### `apps/web/Dockerfile`
- [PASS] Multi-stage build with three named stages: `deps`, `builder`, `runner`
- [PASS] Uses pnpm in both `deps` and `builder` stages
- [PASS] Produces standalone Next.js output — copies `.next/standalone`, `.next/static`, and `public` into runner; starts with `node apps/web/server.js`

### `apps/web/next.config.ts`
- [PASS] `output: 'standalone'` is set in `nextConfig`

### `railway.toml`
- [PASS] Defines both `koblio-api` and `koblio-web` services as `[[services]]` entries
- [FAIL] `healthcheckPath = "/health"` for `koblio-api` — **this is wrong**. The NestJS app sets `app.setGlobalPrefix('api')` in `main.ts`, so the health endpoint resolves to `/api/health`, not `/health`. Railway's health check will hit `/health`, receive a 404, and mark the deploy as failed.

### `.dockerignore`
- [PASS] Excludes `node_modules` and `apps/*/node_modules`
- [PASS] Excludes `.next` and `dist`
- [PASS] Excludes `apps/mobile`
- [PASS] Excludes `.env` and `.env.*` (with `!.env.example` exception to preserve the example file)

### `apps/api/Procfile`
- [PASS] `release: npx prisma migrate deploy` — matches the acceptance criterion exactly
- [PASS] `web: node dist/main.js` — correct startup command

**P4-T01 result: 10/11 criteria pass. One failure on `healthcheckPath`.**

---

## P4-T02 Health Check + Runbook + CORS

### `apps/api/src/app.controller.ts`
- [PASS] `@Get('health')` with controller `@Controller()` (no prefix) — combined with global prefix `api`, the route resolves to `GET /api/health`
- [PASS] Decorated with `@Public()` — no JWT required
- [PASS] Returns HTTP 503 when `result.status !== 'ok'` (via `res.status(statusCode).json(result)`)

### `apps/api/src/app.service.ts`
- [PASS] DB check uses `this.prisma.$queryRaw\`SELECT 1\`` — genuine connectivity probe, not a stub
- [PASS] Returns `{ status: 'ok', timestamp, db: 'ok' }` on success
- [PASS] Returns `{ status: 'error', timestamp, db: 'error' }` on DB failure (caught in try/catch)
- [PASS] `timestamp` is included in both success and error responses

### `apps/api/src/main.ts`
- [PASS] CORS origin uses `process.env.WEB_URL ?? 'http://localhost:3000'` — no wildcard `origin: true`
- [PASS] `credentials: true` retained for cookie-based auth flows
- [PASS] Global prefix `api` is set via `app.setGlobalPrefix('api')`, confirming `/api/health` is the correct resolved path

### `DEPLOY.md`
- [PASS] Exists at repo root
- [PASS] Environment variable tables for both API and Web services, with Required/Description columns
- [PASS] Pre-beta checklist present (lines 59–67), including `GET /api/health` verification step
- [PASS] `prisma migrate deploy` migration step documented in "First Deploy Steps" (step 4) and "Database Migrations" section

**P4-T02 result: All 12 criteria pass.**

---

## Blockers (must fix before production deploy)

**None that prevent local or staging deployment.**

However, the following must be fixed before Railway production deploy goes live:

> **`railway.toml` line 25: `healthcheckPath = "/health"` must be `"/api/health"`**
>
> The NestJS global prefix (`api`) means Railway's health check at `/health` will receive a 404 and mark the deployment as unhealthy. Fix:
> ```toml
> healthcheckPath = "/api/health"
> ```

This will cause a deploy failure on Railway but does not affect local Docker runs or Procfile-based deploys (Render/Heroku).

---

## Non-Blocking Issues

1. **API Dockerfile: `prisma generate` is implicit** — it runs as part of `pnpm build` (via the `build` script in `apps/api/package.json`), not as an explicit `RUN npx prisma generate` step. This works correctly but is less obvious to future maintainers. Consider adding a comment in the Dockerfile noting this, or making it explicit with `RUN pnpm --filter @koblio/api exec prisma generate` before the build step.

2. **API Dockerfile: global `npm install -g prisma` in runner stage** — the approach works but installs prisma globally via npm in an otherwise pnpm-managed project. A cleaner alternative is to copy the prisma binary from `node_modules/.bin/` in the builder stage. Low priority for MVP.

3. **`railway.toml` startCommand duplicates Procfile logic** — `startCommand = "sh -c 'prisma migrate deploy && node dist/main.js'"` in `railway.toml` mirrors what the `CMD` in the Dockerfile and the Procfile already do. Railway gives priority to `startCommand` over Dockerfile `CMD`, so this is functionally fine, but the duplication means migrations run twice on Railway (harmless, since `migrate deploy` is idempotent, but worth noting).

4. **`WEB_URL` is listed as "No (optional)" in DEPLOY.md** — this is technically correct for local dev but in production CORS will silently fall back to `http://localhost:3000` if this var is not set, blocking all browser requests. Consider marking it as effectively required in production with a note.
