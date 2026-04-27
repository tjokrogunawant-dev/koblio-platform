# P4-T01: Docker + Railway Config — Implementation Report

**Date:** 2026-04-27
**Agent:** dev1 (senior DevOps/backend)
**Task:** Dockerize API + Railway Config

---

## Summary

Created production-ready Docker multi-stage builds for both the NestJS API and Next.js web app, Railway multi-service config, a Render-compatible Procfile, and a root `.dockerignore`. Updated `apps/web/next.config.ts` to enable standalone output required by the Next.js Docker image.

---

## Files Created / Modified

| File | Action |
|---|---|
| `apps/api/Dockerfile` | Created — 3-stage multi-stage build |
| `apps/web/Dockerfile` | Created — 3-stage multi-stage build with standalone output |
| `railway.toml` | Created — multi-service config for Railway |
| `apps/api/Procfile` | Created — release + web process for Render |
| `.dockerignore` | Created — root-level ignore file |
| `apps/web/next.config.ts` | Modified — added `output: 'standalone'` |

---

## Key Decisions

### Package Manager: pnpm (not npm)
Root `package.json` declares `"packageManager": "pnpm@10.33.0"` and the lockfile is `pnpm-lock.yaml`. All Dockerfile `RUN` commands use `pnpm` with `corepack enable` to activate it. The template in the task spec used `npm ci --workspace` which would not work with this repo.

### Prisma Migration on Start
The API `CMD` runs `prisma migrate deploy && node dist/main.js`. This is the recommended Railway/Render pattern — migrations run once per deploy, are idempotent (skips already-applied migrations), and block server start until the schema is up to date. The `Procfile` uses the Heroku `release` dyno type for the same effect on Render.

### Standalone Next.js Output
Added `output: 'standalone'` to `next.config.ts`. Next.js standalone mode traces all required files and produces a self-contained `server.js` + bundled `node_modules`, shrinking the final image significantly. The runner stage copies:
- `.next/standalone` → root (`./`)
- `.next/static` → `apps/web/.next/static` (must match standalone's expected path)
- `public/` → `apps/web/public`

### Railway `source = "."` (monorepo root)
Railway does not support per-service source directories in `railway.toml` the same way as individual repos. Both services set `source = "."` so Docker build context is the monorepo root — required because both Dockerfiles `COPY . .` to get all workspace packages.

### `.dockerignore` Placement
Root-level `.dockerignore` is applied when Docker build context is the monorepo root. It excludes `node_modules`, `.next`, `.turbo`, `dist`, `.env*` (except `.env.example`), `apps/mobile`, and `.git` to keep context lean.

---

## Environment Variables Required (Railway Dashboard)

### koblio-api service
```
DATABASE_URL        (injected automatically by Railway PostgreSQL plugin)
AUTH0_ISSUER_URL
AUTH0_AUDIENCE
AUTH0_CLIENT_ID
AUTH0_ROLES_NAMESPACE
JWT_SECRET
SENTRY_DSN
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
WEB_URL             (set to https://koblio-web.up.railway.app or custom domain)
PORT                (Railway injects this automatically — do not hardcode)
```

### koblio-web service
```
NEXT_PUBLIC_API_URL   (set to https://koblio-api.up.railway.app/api)
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
```

---

## Deployment Steps (First Deploy)

1. Push this branch to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo**.
3. Add two services: `koblio-api` and `koblio-web`, each pointing to the respective Dockerfile.
4. Attach a **Railway PostgreSQL** plugin to `koblio-api` — Railway injects `DATABASE_URL`.
5. Set all env vars listed above in each service's Variables tab.
6. Deploy — `prisma migrate deploy` runs automatically before server start.
7. Verify health checks pass:
   - API: `GET /health` → 200
   - Web: `GET /` → 200

---

## Potential Issues / Watch Points

- **`packages/*/node_modules`** — pnpm with `--frozen-lockfile` installs shared packages into the workspace root `node_modules`. If Railway's build times are slow, consider pinning a smaller Node alpine variant or enabling Railway's build cache.
- **Sentry source maps** — `withSentryConfig` in `next.config.ts` uploads source maps at build time if `SENTRY_AUTH_TOKEN` is set. Add it as a build-time env var in Railway if source maps are needed.
- **`prisma generate`** — runs as part of `pnpm --filter @koblio/api build` (the build script is `prisma generate && nest build`). Prisma client is generated into `node_modules/@prisma/client` in the builder stage and copied with `node_modules` to the runner.
