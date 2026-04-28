# Dev Report: TG1-T03 — Forgot Password / Reset Flow

**Sprint:** 19  
**Task ID:** TG1-T03  
**Implemented by:** DEV  
**Date:** 2026-04-28

---

## Summary

Full forgot-password / reset-password flow implemented: Prisma model, migration, API endpoints, email method, and two web pages. Students are excluded by design (no email, COPPA). Token is hashed before storage; raw token only lives in memory and in the email link.

---

## Files Created

| File | Purpose |
|---|---|
| `apps/api/prisma/migrations/20260428120000_add_password_reset_tokens/migration.sql` | DB migration — `password_reset_tokens` table |
| `apps/api/src/auth/dto/forgot-password.dto.ts` | DTO for `POST /auth/forgot-password` |
| `apps/api/src/auth/dto/reset-password.dto.ts` | DTO for `POST /auth/reset-password` |
| `apps/web/src/app/forgot-password/page.tsx` | `/forgot-password` page (email form + success state) |
| `apps/web/src/app/reset-password/page.tsx` | `/reset-password` page (reads `?token=`, confirms + redirect) |

## Files Modified

| File | Change |
|---|---|
| `apps/api/prisma/schema.prisma` | Added `PasswordResetToken` model + `passwordResetTokens` relation on `User` |
| `apps/api/src/notification/email.service.ts` | Added `sendPasswordReset(to, resetUrl)` — logs in DEV, sends via SendGrid in prod |
| `apps/api/src/auth/auth.service.ts` | Added `forgotPassword` and `resetPassword` — imports `createHash`, `randomBytes`, `BadRequestException`, `EmailService` |
| `apps/api/src/auth/auth.controller.ts` | Added `POST /auth/forgot-password` and `POST /auth/reset-password` (`@Public()`) |
| `apps/api/src/auth/auth.module.ts` | Added `NotificationModule` to imports so `EmailService` is injectable |
| `apps/web/src/app/login/login-form.tsx` | Added "Forgot password?" link (adult tab only) above password input |

---

## Key implementation notes

- Token is `randomBytes(32).toString('hex')` — 64 hex chars (256-bit entropy).
- Only the `SHA-256` hash is stored in DB; raw token never persisted.
- Any existing unused tokens for a user are deleted before a new one is created (prevents token accumulation).
- `forgotPassword` is silent for unregistered emails — same 200 response regardless (no user enumeration).
- `$transaction([...])` array form used for atomic password update + token mark-used.
- Both web pages wrap their form component in `<Suspense>` to satisfy Next.js 15 static rendering requirements.
- "Forgot password?" link only renders in the `adult` tab of the login form (students have no email).

---

## Commit

Commit hash: _(to be filled after push)_
