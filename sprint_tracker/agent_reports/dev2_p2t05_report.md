# Dev Report: P2-T05 — Stripe Subscription Paywall

**Date:** 2026-04-27
**Agent:** Implementation Agent (dev2)
**Task:** P2-T05 — Stripe Checkout-based subscriptions for parent users

---

## Summary

Implemented a full soft-paywall Stripe subscription flow. When `STRIPE_SECRET_KEY` is absent the service degrades gracefully — all methods return `null` and the frontend shows a "Coming soon" message instead of an error.

---

## Files Changed

### API (`apps/api/`)

**`prisma/schema.prisma`**
- Added three fields to `User` model: `subscriptionStatus` (default `"free"`), `stripeCustomerId` (unique), `subscriptionId`

**`prisma/migrations/20260427080000_add_stripe/migration.sql`**
- Raw `ALTER TABLE` migration with `IF NOT EXISTS` guards

**`package.json`**
- Added `"stripe": "^14.0.0"` dependency

**`src/stripe/stripe.service.ts`** (new)
- `StripeService` with three methods: `createCheckoutSession`, `getOrCreateCustomer`, `constructWebhookEvent`
- Initialises Stripe only when `STRIPE_SECRET_KEY` is present; all methods return `null` and log a warning otherwise

**`src/stripe/stripe.controller.ts`** (new)
- `POST /stripe/create-checkout` — JWT-guarded, `@Roles(UserRole.PARENT)`, creates/fetches Stripe customer, persists `stripeCustomerId`, returns checkout URL
- `POST /stripe/webhook` — `@Public()`, reads raw body Buffer placed by `express.raw()` middleware, verifies Stripe signature, handles `customer.subscription.created/updated/deleted` events to update `subscriptionStatus`

**`src/stripe/stripe.module.ts`** (new)
- Standard NestJS module importing `PrismaModule`

**`src/app.module.ts`**
- Imported and registered `StripeModule`

**`src/main.ts`**
- Added `express.raw({ type: 'application/json' })` middleware scoped to `/api/stripe/webhook` before other middleware, so Stripe signature verification receives the unmodified body

### Web (`apps/web/`)

**`src/lib/api.ts`**
- Added `createCheckoutSession(token)` function calling `POST /stripe/create-checkout`

**`src/app/subscribe/page.tsx`** (new)
- "Go Premium" landing page with feature list and $9.99/month CTA
- Loading state while redirecting to Stripe Checkout
- Falls back to "Coming soon" message if API returns `url: null`

**`src/app/subscribe/success/page.tsx`** (new)
- Confirmation page: "Payment Successful! Your account is now Premium."
- Link back to parent dashboard

**`src/app/subscribe/cancel/page.tsx`** (new)
- Cancellation page: "No worries — you can subscribe anytime."
- Link back to parent dashboard

---

## Architecture Decisions

- **Soft paywall only**: `subscriptionStatus` is tracked but existing features are not hard-blocked; premium gating of specific content is deferred to Section 6 per the roadmap.
- **Graceful degradation**: `StripeService` constructor checks for `STRIPE_SECRET_KEY` once; all public methods are safe to call without the key configured.
- **Raw body scoped narrowly**: `express.raw()` is applied only to `/api/stripe/webhook` path — the rest of the API continues to receive JSON-parsed bodies from NestJS's default parser.
- **No JWT on webhook**: `@Public()` decorator bypasses `JwtAuthGuard`; Stripe signature verification replaces auth for that endpoint.

---

## Environment Variables Required (for production)

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_… / sk_test_…) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe dashboard |
| `STRIPE_PRICE_ID` | Price ID for the $9.99/month subscription product |
| `WEB_URL` | Frontend URL for redirect (default: `http://localhost:3001`) |

---

## Status

All acceptance criteria met. No `npm install` performed (Stripe added to `package.json` only — user must install on Windows/Railway deploy).
