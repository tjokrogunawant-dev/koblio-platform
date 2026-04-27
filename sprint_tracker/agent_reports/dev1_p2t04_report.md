# P2-T04 Implementation Report — Weekly Email Digest (SendGrid)

**Date:** 2026-04-27
**Agent:** dev1
**Task:** P2-T04 — Weekly Email Digest

---

## Summary

Implemented a weekly email digest system that sends per-child progress summaries to all parents every Monday at 8am UTC via SendGrid.

---

## Files Changed

### `apps/api/package.json`
- Added `@sendgrid/mail: ^8.1.4` to dependencies
- Added `@nestjs/schedule: ^4.1.2` to dependencies

### `apps/api/src/notification/email.service.ts` (new)
- `EmailService` injectable — wraps `@sendgrid/mail`
- Disabled-by-default: if `SENDGRID_API_KEY` is absent, logs a warning and returns without throwing
- `sendWeeklyDigest(to, parentName, children)` builds a clean HTML email (table with XP, attempts, accuracy, streak, badges) and sends it
- `FROM_EMAIL` reads `SENDGRID_FROM_EMAIL` env var, falling back to `noreply@koblio.com`
- Exports `WeeklyChildSummary` interface

### `apps/api/src/notification/digest.service.ts` (new)
- `DigestService` injectable with `@Cron('0 8 * * 1')` cron trigger
- `sendWeeklyDigests()` — queries all `PARENT` role users with non-null email, then for each:
  - Iterates `parentLinks` to get linked children
  - Queries `StudentProblemAttempt` (last 7 days) for attempt count + correct count
  - Queries `PointsLedger` (last 7 days) and sums `amount` for XP earned
  - Queries `Badge` (last 7 days) for newly awarded badge names
  - Reads `streakCount` directly from the child user record
  - Calls `EmailService.sendWeeklyDigest` per parent; catches + logs individual errors so one failure doesn't block the rest

### `apps/api/src/notification/notification.module.ts` (updated)
- Added `ScheduleModule.forFeature()` and `PrismaModule` to imports
- Registered `EmailService` and `DigestService` as providers + exports

### `apps/api/src/app.module.ts` (updated)
- Added `ScheduleModule.forRoot()` to AppModule imports (required once at root)

### `apps/api/src/notification/digest.service.spec.ts` (new)
Four unit tests covering:
1. Skips parents with null email — `sendWeeklyDigest` never called
2. Correct child summary built and sent — XP, attempts, accuracy, badges, streak all aggregated properly
3. Parent with no linked children — sends with empty `[]` summaries array (email still dispatched, body shows empty state)
4. Error resilience — if one parent send throws, subsequent parents are still processed

---

## Design Decisions

- **XP via PointsLedger** (not raw XP delta): The `xp` column on `User` is a running total. To compute weekly XP earned we sum `PointsLedger.amount` for the past 7 days — this is already populated by `GamificationService.awardForAttempt`.
- **Per-parent try/catch**: A SendGrid transient failure for one parent should not abort the whole batch.
- **COPPA note**: Students may have `email = null`; parents should always have email set. The query filters `email: { not: null }` plus a runtime `if (!parent.email) continue` guard for safety.
- **`ScheduleModule.forFeature()`** is used in `NotificationModule` alongside `forRoot()` in `AppModule` — this is the correct NestJS pattern for feature-level cron registration.

---

## Required Environment Variables

| Variable | Required | Default |
|---|---|---|
| `SENDGRID_API_KEY` | No (disables email if absent) | — |
| `SENDGRID_FROM_EMAIL` | No | `noreply@koblio.com` |
