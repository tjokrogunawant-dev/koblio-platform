# Koblio Deployment Runbook

## Prerequisites
- Railway account + CLI (`npm i -g @railway/cli`)
- PostgreSQL 16 database provisioned (Railway PostgreSQL plugin or Neon)
- Auth0 tenant configured (see Auth0 setup section)
- SendGrid account (optional — email digest disabled if absent)
- Stripe account (optional — payments disabled if absent)

## Environment Variables

### API Service (`apps/api`)
| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | ≥32 char secret for student JWT |
| AUTH0_ISSUER_URL | Yes | https://YOUR_TENANT.auth0.com/ |
| AUTH0_AUDIENCE | Yes | https://api.koblio.com |
| AUTH0_CLIENT_ID | Yes | Auth0 API client ID |
| AUTH0_ROLES_NAMESPACE | Yes | https://koblio.com/roles |
| PORT | No | Default: 3001 (Railway sets this) |
| SENTRY_DSN | No | Error tracking |
| SENDGRID_API_KEY | No | Disables email digest if absent |
| SENDGRID_FROM_EMAIL | No | Default: noreply@koblio.com |
| STRIPE_SECRET_KEY | No | Disables Stripe if absent |
| STRIPE_WEBHOOK_SECRET | No | Required when Stripe is active |
| STRIPE_PRICE_ID | No | Monthly subscription price ID |
| WEB_URL | No | Default: http://localhost:3000 |

### Web Service (`apps/web`)
| Variable | Required | Description |
|---|---|---|
| NEXT_PUBLIC_API_URL | Yes | API base URL (e.g. https://api.koblio.com/api) |
| AUTH0_SECRET | Yes | NextAuth session secret |
| AUTH0_BASE_URL | Yes | Web app URL (e.g. https://app.koblio.com) |
| AUTH0_ISSUER_BASE_URL | Yes | https://YOUR_TENANT.auth0.com |
| AUTH0_CLIENT_ID | Yes | Auth0 web client ID |
| AUTH0_CLIENT_SECRET | Yes | Auth0 web client secret |

## First Deploy Steps
1. `railway login`
2. `railway init` — link to project
3. Set all required env vars via Railway dashboard or `railway variables set KEY=VALUE`
4. Deploy API service first (runs `prisma migrate deploy` via Procfile `release` step)
5. Seed the database: `railway run --service koblio-api npx prisma db seed`
6. Deploy web service

## Database Migrations
- New migrations run automatically via `prisma migrate deploy` in the Procfile `release` step
- To add a new migration: create SQL file in `apps/api/prisma/migrations/` following the existing naming convention

## Auth0 Setup
- Create a "Regular Web Application" for the Next.js frontend
- Create a "Machine-to-Machine" or "API" application for the NestJS backend
- Add `https://app.koblio.com/api/auth/callback` to Allowed Callback URLs
- Add `https://app.koblio.com` to Allowed Logout URLs
- Create a custom claim action: namespace `https://koblio.com/roles`, claim `roles` from user metadata

## Pre-Beta Checklist
- [ ] DATABASE_URL points to production PostgreSQL
- [ ] JWT_SECRET is a cryptographically random 64-char string
- [ ] Auth0 callback URLs match production domain
- [ ] `GET /api/health` returns `{ status: 'ok', db: 'ok' }`
- [ ] Seed data loaded (200 problems across Grades 1-3)
- [ ] Sentry DSN configured and receiving test events
- [ ] CORS origin set to production web URL (not wildcard)
