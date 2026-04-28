# Dev Report: TG1-T03 — Forgot Password / Reset Flow

**Sprint:** 19  
**Task ID:** TG1-T03  
**Implemented by:** DEV  
**Date:** 2026-04-28  
**Commit:** `e37943a`

---

## Summary

Implemented a full token-based forgot-password / reset-password flow. A `POST /auth/forgot-password` endpoint generates a SHA-256-hashed token, stores it in a new `password_reset_tokens` table, and sends an email via `EmailService`. `POST /auth/reset-password` validates the token (checking expiry and one-time-use), then updates the user's password hash and marks the token used. Two new Next.js pages (`/forgot-password`, `/reset-password`) handle the web UI. The login page now shows a "Forgot password?" link visible only in the Parent/Teacher tab.

---

## Files Created

| File | Description |
|---|---|
| `apps/api/prisma/migrations/20260428120000_add_password_reset_tokens/migration.sql` | Creates `password_reset_tokens` table with token_hash unique index and FK to users |
| `apps/api/src/auth/dto/forgot-password.dto.ts` | DTO for `POST /auth/forgot-password` — validates email |
| `apps/api/src/auth/dto/reset-password.dto.ts` | DTO for `POST /auth/reset-password` — validates token (min 64 chars) and newPassword (min 8 chars) |
| `apps/web/src/app/forgot-password/page.tsx` | Email entry form; shows success message without navigating; wraps in `<Suspense>` |
| `apps/web/src/app/reset-password/page.tsx` | Password + confirm form; reads `?token=` from URL via `useSearchParams`; redirects to `/login?reset=1` on success; wrapped in `<Suspense>` |

## Files Modified

| File | Change |
|---|---|
| `apps/api/prisma/schema.prisma` | Added `PasswordResetToken` model; added `passwordResetTokens PasswordResetToken[]` relation on `User` |
| `apps/api/src/notification/email.service.ts` | Added `sendPasswordReset(to, resetUrl)` method — logs link at DEBUG when SendGrid disabled |
| `apps/api/src/auth/auth.service.ts` | Added `createHash/randomBytes` imports, `BadRequestException` import, `EmailService` injection, `forgotPassword()` and `resetPassword()` methods |
| `apps/api/src/auth/auth.controller.ts` | Added `ForgotPasswordDto`/`ResetPasswordDto` imports; added `@Post('forgot-password')` and `@Post('reset-password')` endpoints (both `@Public()`) |
| `apps/api/src/auth/auth.module.ts` | Added `NotificationModule` import to make `EmailService` available for injection in `AuthService` |
| `apps/web/src/app/login/login-form.tsx` | Wrapped password label in flex header; added "Forgot password?" `<Link>` visible only when `tab === 'adult'` |

---

## Acceptance Criteria Checklist (self-assessment)

| # | Criterion | Status |
|---|---|---|
| AC1 | `POST /auth/forgot-password` registered email → `200 { message: "If that email is registered..." }` | ✅ |
| AC2 | `POST /auth/forgot-password` unregistered email → same `200` (no user enumeration) | ✅ |
| AC3 | No `SENDGRID_API_KEY` → reset URL logged at DEBUG level | ✅ |
| AC4 | `POST /auth/reset-password` valid token → `200 { message: "Password updated" }`, password changed | ✅ |
| AC5 | Same token second time → `400` (token marked `usedAt`) | ✅ |
| AC6 | Garbage token → `400` | ✅ |
| AC7 | `/forgot-password` shows email form; submit shows success text in-place | ✅ |
| AC8 | `/reset-password?token=valid` → success redirects to `/login?reset=1` | ✅ |
| AC9 | `/reset-password?token=invalid` → shows error from API | ✅ |
| AC10 | Login page "Forgot password?" link visible only in adult tab | ✅ |
| AC11 | Migration SQL file exists at expected path with valid syntax | ✅ |

---

## Notes

- Raw token is never stored — only `SHA-256(rawToken)` is written to DB. Raw token lives only in memory and in the email link.
- `forgotPassword` is a no-op for users with no email (COPPA — students have no email field).
- Existing unused tokens for a user are deleted before creating a new one (prevents token accumulation).
- Both web pages wrap their inner component in `<Suspense>` to satisfy Next.js 15's requirement for `useSearchParams` in client components.
- `NotificationModule` imports only `PrismaModule` + `ScheduleModule` — no circular dependency risk with `AuthModule`.
