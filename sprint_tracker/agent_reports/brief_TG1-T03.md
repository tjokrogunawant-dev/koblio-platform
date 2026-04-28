# Brief: TG1-T03 — Forgot Password / Reset Flow

**Sprint:** 19  
**Task ID:** TG1-T03  
**Written by:** PM  
**Date:** 2026-04-28

---

## Overview

Parents and teachers can't recover their accounts if they forget their password. This task adds a full forgot-password/reset-password flow: a token-based API (secure, no user enumeration) plus two web pages. Students are intentionally excluded — they don't have email addresses (COPPA), so they reset via their teacher.

---

## Files to Create

| File | Purpose |
|---|---|
| `apps/api/prisma/migrations/20260428120000_add_password_reset_tokens/migration.sql` | DB migration — new table |
| `apps/api/src/auth/dto/forgot-password.dto.ts` | DTO for `POST /auth/forgot-password` |
| `apps/api/src/auth/dto/reset-password.dto.ts` | DTO for `POST /auth/reset-password` |
| `apps/web/src/app/forgot-password/page.tsx` | "Forgot password?" page |
| `apps/web/src/app/reset-password/page.tsx` | "Reset password" page (reads `?token=` from URL) |

## Files to Modify

| File | Change |
|---|---|
| `apps/api/prisma/schema.prisma` | Add `PasswordResetToken` model + relation on `User` |
| `apps/api/src/notification/email.service.ts` | Add `sendPasswordReset(to, resetUrl)` method |
| `apps/api/src/auth/auth.service.ts` | Add `forgotPassword` and `resetPassword` methods |
| `apps/api/src/auth/auth.controller.ts` | Add two new `@Public()` endpoints |
| `apps/api/src/auth/auth.module.ts` | Import `NotificationModule` to inject `EmailService` |
| `apps/web/src/app/login/login-form.tsx` | Add "Forgot password?" link under adult password field |

---

## Step 1 — Prisma Schema

Add to `apps/api/prisma/schema.prisma`:

**New model (add at bottom):**
```prisma
model PasswordResetToken {
  id        String    @id @default(uuid()) @db.Uuid
  tokenHash String    @unique @map("token_hash")
  userId    String    @map("user_id") @db.Uuid
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}
```

**Add to the `User` model** (after `skillMasteries SkillMastery[]`):
```prisma
  passwordResetTokens   PasswordResetToken[]
```

---

## Step 2 — Migration SQL

Create `apps/api/prisma/migrations/20260428120000_add_password_reset_tokens/migration.sql`:

```sql
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Step 3 — DTOs

**`apps/api/src/auth/dto/forgot-password.dto.ts`:**
```typescript
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'teacher@school.com' })
  @IsEmail()
  email: string;
}
```

**`apps/api/src/auth/dto/reset-password.dto.ts`:**
```typescript
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Raw reset token from email link' })
  @IsString()
  @MinLength(64)
  token: string;

  @ApiProperty({ example: 'NewSecurePassword1!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

---

## Step 4 — EmailService: add `sendPasswordReset`

In `apps/api/src/notification/email.service.ts`, add a new method after `sendWeeklyDigest`:

```typescript
async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
  if (!this.enabled) {
    this.logger.debug(`[DEV] Password reset link for ${to}: ${resetUrl}`);
    return;
  }
  await sgMail.send({
    to,
    from: FROM_EMAIL,
    subject: 'Koblio — Reset your password',
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px;">
<h2 style="color:#4f46e5;">Reset your Koblio password</h2>
<p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
<p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
<p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
</body></html>`,
  });
}
```

---

## Step 5 — AuthService: add forgotPassword + resetPassword

Add these imports at the top of `auth.service.ts`:
```typescript
import { createHash, randomBytes } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { EmailService } from '../notification/email.service';
```

Inject `EmailService` in the constructor:
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly emailService: EmailService,
) {}
```

Add methods:

```typescript
async forgotPassword(email: string): Promise<void> {
  const SAFE_RESPONSE = undefined; // always return same response

  const user = await this.prisma.user.findUnique({ where: { email } });

  if (user && user.email) {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing unused tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    await this.prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    const webBase = process.env.WEB_BASE_URL ?? 'http://localhost:3001';
    const resetUrl = `${webBase}/reset-password?token=${rawToken}`;
    await this.emailService.sendPasswordReset(user.email, resetUrl);
  }

  return SAFE_RESPONSE;
}

async resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const record = await this.prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt !== null || record.expiresAt < new Date()) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
```

---

## Step 6 — AuthController: add two endpoints

Add to imports at top:
```typescript
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
```

Add after the `loginStudent` endpoint:

```typescript
@Post('forgot-password')
@Public()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Request a password reset link' })
@ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
async forgotPassword(@Body() dto: ForgotPasswordDto) {
  await this.authService.forgotPassword(dto.email);
  return { message: "If that email is registered, you'll receive a reset link." };
}

@Post('reset-password')
@Public()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Reset password using token from email' })
@ApiResponse({ status: 200, description: 'Password updated' })
@ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
async resetPassword(@Body() dto: ResetPasswordDto) {
  await this.authService.resetPassword(dto.token, dto.newPassword);
  return { message: 'Password updated' };
}
```

---

## Step 7 — AuthModule: import NotificationModule

In `apps/api/src/auth/auth.module.ts`:

Add `NotificationModule` to imports:
```typescript
import { NotificationModule } from '../notification/notification.module';
// ...
@Module({
  imports: [
    NotificationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ ... }),
  ],
  // ...
})
```

`EmailService` is already exported from `NotificationModule`, so it will be available for injection.

---

## Step 8 — Web: `/forgot-password` page

Create `apps/web/src/app/forgot-password/page.tsx`:

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent>
            <p className="text-center text-sm text-slate-600">
              Check your email — if that address is registered, we sent a reset link.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm text-indigo-600 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
```

---

## Step 9 — Web: `/reset-password` page

Create `apps/web/src/app/reset-password/page.tsx`:

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Reset failed');
      }
      router.push('/login?reset=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose a new password</CardTitle>
          <CardDescription>Your new password must be at least 8 characters.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New password</label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? 'Saving…' : 'Set new password'}
            </Button>
            <Link href="/login" className="text-sm text-indigo-600 hover:underline">
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
```

---

## Step 10 — Login page: add "Forgot password?" link

In `apps/web/src/app/login/login-form.tsx`, inside the adult tab's password field block, add a link below the label:

Change this block (password label for adult tab):
```tsx
<div className="space-y-2">
  <label htmlFor="password" className="text-sm font-medium">
    Password
  </label>
```

To:
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <label htmlFor="password" className="text-sm font-medium">
      Password
    </label>
    {tab === 'adult' && (
      <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
        Forgot password?
      </Link>
    )}
  </div>
```

---

## Acceptance Criteria

| # | Criterion | How to verify |
|---|---|---|
| AC1 | `POST /auth/forgot-password` with a registered email returns `200 { message: "If that email is registered..." }` | curl / Jest |
| AC2 | `POST /auth/forgot-password` with an unregistered email also returns `200` same message (no enumeration) | curl / Jest |
| AC3 | When `SENDGRID_API_KEY` is not set, the raw reset URL is logged at DEBUG level | Inspect logs |
| AC4 | `POST /auth/reset-password` with a valid unexpired token sets the new password and returns `{ message: "Password updated" }` | curl / Jest |
| AC5 | `POST /auth/reset-password` with the same token a second time returns `400` ("Invalid or expired reset token") — token is marked used | curl / Jest |
| AC6 | `POST /auth/reset-password` with a garbage token returns `400` | curl |
| AC7 | `/forgot-password` renders an email form; on submit shows success text without navigating | Manual |
| AC8 | `/reset-password?token=<valid>` renders password form; on success redirects to `/login?reset=1` | Manual |
| AC9 | `/reset-password?token=<invalid>` shows "Invalid or expired reset token" error on submit | Manual |
| AC10 | Login page shows "Forgot password?" link visible only in the adult (Parent/Teacher) tab | Manual |
| AC11 | Prisma migration file exists at the expected path and SQL is syntactically valid | File check |

---

## Gotchas

- **Never return different responses for registered vs. unregistered email** — same 200 response always (user enumeration prevention).
- **Store token hash, not raw token** — `createHash('sha256').update(rawToken).digest('hex')`. Raw token only exists in memory and in the email link.
- **Students have no email** — `forgotPassword` silently does nothing if the user is a student or has no email field set.
- **NotificationModule circular dep risk**: `NotificationModule` imports only `PrismaModule` and `ScheduleModule`, so importing it inside `AuthModule` is safe (no circular reference).
- **`$transaction` array form** — Prisma interactive transactions (`async (tx) => {}`) are fine, but the array form `[update1, update2]` is simpler and sufficient here since both writes are independent.
- **`useSearchParams` in Next.js 15** requires the component to be wrapped in a `Suspense` boundary if used in a server context. Since the whole page is `'use client'` with direct use of `useSearchParams`, wrap the default export in `<Suspense>` to avoid the static rendering warning:
  ```tsx
  import { Suspense } from 'react';
  // ...
  function ResetPasswordForm() { /* ... the form component ... */ }
  export default function ResetPasswordPage() {
    return <Suspense><ResetPasswordForm /></Suspense>;
  }
  ```
  Apply the same pattern to `/forgot-password` for consistency if `useSearchParams` is used there (it isn't, but the pattern is good practice).
