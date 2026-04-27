# Sprint 10 QC Report

**Date:** 2026-04-27
**Reviewer:** QC Agent
**Sprint Goal:** Weekly email digest (SendGrid) + Stripe subscription paywall

## Overall Status: PASS WITH MINOR ISSUES

Both features are implemented, architecturally sound, and meet the bulk of their acceptance criteria. One non-blocking body-parser ordering concern in the Stripe webhook setup warrants a follow-up fix before Trial Gate 2 (when real Stripe events will be received).

---

## P2-T04 Weekly Email Digest

### Acceptance Criteria

- [x] **`@nestjs/schedule` and `@sendgrid/mail` present in package.json**
  `@nestjs/schedule: ^4.1.2` and `@sendgrid/mail: ^8.1.4` are both listed under `dependencies` in `apps/api/package.json`.

- [x] **`EmailService`: disabled gracefully when `SENDGRID_API_KEY` absent**
  `EmailService` constructor checks `process.env.SENDGRID_API_KEY`. If absent, `this.enabled = false` and `sendWeeklyDigest` immediately logs a warning and returns — it does not throw. Correct.

- [x] **`DigestService`: cron expression `0 8 * * 1` (Monday 8am UTC)**
  `@Cron('0 8 * * 1')` decorates `handleWeeklyCron()` in `digest.service.ts`. Correct.

- [x] **Digest skips parents with null email**
  The Prisma query filters `email: { not: null }` at the DB level AND an explicit `if (!parent.email) continue;` guard exists in the loop as a double-safety net. Correct.

- [x] **Per-parent try/catch so one failure doesn't abort the batch**
  The `try/catch` wrapping `emailService.sendWeeklyDigest()` is inside the `for (const parent of parents)` loop. An error for one parent is logged and the loop continues. Correct.

- [x] **XP aggregation: uses 7-day window, not total user.xp**
  `pointsLedger.findMany` queries `createdAt: { gte: sevenDaysAgo }` and sums `amount` fields — this is the windowed ledger, not `user.xp`. Correct.

- [x] **Unit tests cover: null-email skip, correct aggregation, empty children**
  `digest.service.spec.ts` contains four tests:
  - `'skips parents with null email'` — verifies `sendWeeklyDigest` is not called
  - `'calls sendWeeklyDigest once per parent with linked children'` — verifies XP (15), attempts (2), correct (1), badges, streak
  - `'sends empty summaries when parent has no linked children'` — verifies called with `[]`
  - `'continues processing remaining parents if one send fails'` — verifies both parents are attempted
  All cases covered. Correct.

- [x] **`ScheduleModule.forRoot()` registered in app.module.ts**
  `ScheduleModule.forRoot()` is imported in `app.module.ts`. Additionally, `notification.module.ts` imports `ScheduleModule.forFeature()`, which is the correct pattern for feature modules registering cron jobs when the root already calls `forRoot()`. Correct.

### P2-T04 Findings

No blockers or issues. All eight criteria pass cleanly.

---

## P2-T05 Stripe Subscriptions

### Acceptance Criteria

- [x] **Three new fields on User in schema + migration SQL**
  `schema.prisma` User model contains:
  - `subscriptionStatus String? @default("free") @map("subscription_status")`
  - `stripeCustomerId String? @unique @map("stripe_customer_id")`
  - `subscriptionId String? @map("subscription_id")`
  Migration `20260427080000_add_stripe/migration.sql` adds all three columns with `ADD COLUMN IF NOT EXISTS`. Correct.

- [x] **`StripeService` returns null/warns when `STRIPE_SECRET_KEY` absent — never throws**
  Constructor sets `this.stripe = key ? new Stripe(key) : null`. All three public methods (`createCheckoutSession`, `getOrCreateCustomer`, `constructWebhookEvent`) check `if (!this.stripe)`, log a warning, and return `null`. No throws. Correct.

- [x] **`POST /stripe/create-checkout` is JWT-guarded with PARENT role**
  The route has `@Roles(UserRole.PARENT)`. The global `JwtAuthGuard` (registered as `APP_GUARD` in `app.module.ts`) enforces JWT for all routes not marked `@Public()`. The global `RolesGuard` enforces the `@Roles` decorator. The endpoint is not marked `@Public()`, so JWT is required. Correct.

- [x] **`POST /stripe/webhook` is marked `@Public()` (skips JWT)**
  `@Public()` decorator is applied to `handleWebhook()` in `stripe.controller.ts`. The `@Public()` decorator sets `IS_PUBLIC_KEY` metadata and `JwtAuthGuard.canActivate` returns `true` when this key is detected. The decorator is correctly defined in `apps/api/src/auth/decorators/public.decorator.ts`. Correct.

- [x] **Webhook handler updates subscriptionStatus to 'active' on subscription.created/updated**
  `processEvent` handles `customer.subscription.created` and `customer.subscription.updated`, calling `prisma.user.updateMany` with `subscriptionStatus: 'active'` and `subscriptionId: sub.id`. Correct.

- [x] **Webhook handler updates subscriptionStatus to 'canceled' on subscription.deleted**
  `processEvent` handles `customer.subscription.deleted`, calling `prisma.user.updateMany` with `subscriptionStatus: 'canceled'`. Correct.

- [~] **`express.raw()` applied ONLY to the webhook route — critical path match**
  `main.ts` line 15: `app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))`.
  The global prefix is `api` (set on line 20), the controller prefix is `stripe`, and the route is `webhook`, so the effective URL is `/api/stripe/webhook`. The path in `app.use()` matches. **However**, `NestFactory.create(AppModule)` without `{ bodyParser: false }` means NestJS registers its own `express.json()` body parser internally before any user-registered middleware runs. In practice, this means `req.body` on the webhook route may already be a parsed JSON object (not a `Buffer`) by the time the route handler is reached, which will cause `stripe.webhooks.constructEvent` to fail with a signature verification error when receiving real Stripe events. This is a latent bug that will not surface during development (where the API key is absent and `constructWebhookEvent` returns null without touching the body), but will break in staging/production. **See Blockers section.**

- [x] **Subscribe page has "Coming soon" fallback when url is null**
  `subscribe/page.tsx` sets `comingSoon = true` when `url` is falsy and renders a "Coming soon!" message. Correct.

- [x] **`createCheckoutSession` in api.ts calls the correct backend endpoint**
  `api.ts` calls `${API_BASE}/stripe/create-checkout` with a POST and `Authorization: Bearer ${token}` header. `API_BASE` is `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`. Since the API's global prefix is `api`, the full backend URL resolves to `http://localhost:3001/api/stripe/create-checkout`. This matches the NestJS route. Correct.

---

## Blockers (must fix before Sprint 11)

None that block Sprint 11 development work. However, the following should be resolved before real Stripe events are received (i.e., before Trial Gate 2):

**[S10-B1] Webhook body parser ordering — raw body may not reach handler as a Buffer**

File: `apps/api/src/main.ts`

NestJS's `NestFactory.create(AppModule)` automatically registers `express.json()` and `express.urlencoded()` as global body parsers before any `app.use()` middleware added after creation. As a result, POST bodies (including the Stripe webhook) are parsed into JSON objects before the `express.raw()` middleware on `/api/stripe/webhook` has a chance to intercept. When `stripe.webhooks.constructEvent(payload, signature, secret)` receives a parsed object instead of a raw Buffer, the signature check fails.

Recommended fix:

```typescript
// main.ts — disable NestJS automatic body parsing
const app = await NestFactory.create(AppModule, { bodyParser: false });

// Stripe webhook: raw body required for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// All other routes: standard JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

This is safe to defer until before Trial Gate 2 because: (a) `STRIPE_SECRET_KEY` is absent in development so the body is never accessed, and (b) Sprint 11 work does not depend on live webhooks.

---

## Non-Blocking Issues

**[S10-N1] `stripe` package version is `^14.0.0` but Stripe API version is `2024-06-20`**
The `stripe` npm package v14 corresponds to Stripe API version `2024-06-20`, so the pin is consistent. Minor note: Stripe has since released newer API versions. Not a functional issue for MVP but worth updating before Trial Gate 2.

**[S10-N2] `WEB_URL` env var defaults to `http://localhost:3001` in `stripe.controller.ts`**
The success and cancel redirect URLs point to `${WEB_URL}/subscribe/success` and `${WEB_URL}/subscribe/cancel`. The default `http://localhost:3001` is the API port, not the web port (`3000`). This is harmless in development (no live Stripe key), but the env var must be set correctly in production. Consider changing the default to `http://localhost:3000` or adding a note in `.env.example`.

**[S10-N3] No unit tests for `StripeService` or `StripeController`**
`DigestService` has thorough unit tests. The Stripe module has none. Given the webhook logic handles subscription lifecycle, a test covering the `processEvent` branch for `subscription.created`, `subscription.updated`, and `subscription.deleted` would increase confidence. Recommended addition in Sprint 11 or as a polish task.
