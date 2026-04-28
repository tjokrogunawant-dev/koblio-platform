# QC Report: TG1-T03 — Forgot Password / Reset Flow

**Sprint:** 19  
**Task ID:** TG1-T03  
**Reviewed by:** QA  
**Date:** 2026-04-28  
**Verdict:** PASS WITH NBI

---

## Acceptance Criteria Results

| # | Criterion | Result | Notes |
|---|---|---|---|
| AC1 | `POST /auth/forgot-password` registered email → `200 { message: "If that email is registered..." }` | ✅ PASS | Controller always returns same message; service silently does work |
| AC2 | `POST /auth/forgot-password` unregistered email → same `200` (no user enumeration) | ✅ PASS | `forgotPassword()` is a no-op when user not found; controller response is identical |
| AC3 | No `SENDGRID_API_KEY` → reset URL logged at DEBUG level | ✅ PASS | `email.service.ts:28-30`: `logger.debug(...)` fires when `this.enabled` is false |
| AC4 | `POST /auth/reset-password` valid token → `200 { message: "Password updated" }`, password changed | ✅ PASS | Service hashes password, updates user and marks token used in one transaction |
| AC5 | Same token second time → `400` (token marked `usedAt`) | ✅ PASS | `record.usedAt !== null` check throws `BadRequestException` on re-use |
| AC6 | Garbage token → `400` | ✅ PASS | Hash lookup returns null; `!record` triggers `BadRequestException` |
| AC7 | `/forgot-password` shows email form; submit shows success text in-place | ✅ PASS | `setSubmitted(true)` swaps form for success message; no navigation |
| AC8 | `/reset-password?token=valid` → success redirects to `/login?reset=1` | ✅ PASS | `router.push('/login?reset=1')` on `res.ok` |
| AC9 | `/reset-password?token=invalid` → shows "Invalid or expired reset token" error | ✅ PASS | API 400 body parsed; `err.message` set in state and rendered as alert |
| AC10 | Login page "Forgot password?" link visible only in adult tab | ✅ PASS | `{tab === 'adult' && <Link href="/forgot-password">…</Link>}` at `login-form.tsx:143` |
| AC11 | Migration SQL file exists at expected path with valid syntax | ✅ PASS | File present at `apps/api/prisma/migrations/20260428120000_add_password_reset_tokens/migration.sql` with correct DDL |

---

## Security Checks

| Check | Result |
|---|---|
| Raw token never stored — only `SHA-256(rawToken)` in DB | ✅ |
| Same 200 response for registered and unregistered email (no user enumeration) | ✅ |
| Token expiry enforced (`expiresAt < new Date()`) | ✅ |
| Token one-time-use enforced (`usedAt !== null`) | ✅ |
| Old unused tokens deleted before issuing a new one | ✅ |
| COPPA: students (no email field) silently excluded from flow | ✅ |
| `forgotPassword` does nothing if `user.email` is falsy | ✅ |

---

## Additional Checks

| Check | Result |
|---|---|
| `PasswordResetToken` model in `schema.prisma` matches migration SQL | ✅ |
| `passwordResetTokens PasswordResetToken[]` relation added to `User` model | ✅ |
| `NotificationModule` imported in `AuthModule` (no circular dep) | ✅ |
| Both web pages wrapped in `<Suspense>` for Next.js 15 `useSearchParams` compat | ✅ |
| `ForgotPasswordDto` and `ResetPasswordDto` imported in controller | ✅ |
| Both new endpoints decorated `@Public()` | ✅ |
| `bcrypt`, `createHash`, `randomBytes`, `BadRequestException` all imported in `auth.service.ts` | ✅ |

---

## Non-Blocking Issues (NBI)

| # | Severity | Description |
|---|---|---|
| NBI-1 | Minor | `sendPasswordReset` was placed before `sendWeeklyDigest` in `email.service.ts`, not after as the brief specified. Cosmetic only — no functional impact. |

---

## Summary

All 11 acceptance criteria pass. The implementation is correct, secure, and complete. Security-sensitive properties (no enumeration, hash-only storage, one-time-use, expiry, COPPA exclusion) are all properly implemented. One minor cosmetic NBI: method ordering in `email.service.ts` differs from the brief's specified placement.
