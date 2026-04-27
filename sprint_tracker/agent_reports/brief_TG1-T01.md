# Brief: TG1-T01 — Student Profile Setup Page

**Sprint:** 19  
**Task ID:** TG1-T01  
**Author:** PM Agent  
**Date:** 2026-04-27

---

## What to Build

The `/profile/setup` page skeleton exists at `apps/web/src/app/profile/setup/page.tsx` but is **incomplete**. This task closes three gaps:

1. **Display name confirm field** — students should see their name (set at registration) and be able to edit it before proceeding.
2. **Auth response completeness** — `loginStudent` and `registerStudent` don't return `avatarSlug`, `username`, or `grade` in the `user` payload, so the auth context never knows the student's current avatar after login. Fix both service methods.
3. **Auth context refresh after save** — after saving avatar (and optionally display name), the stored user in `localStorage` must be updated so the "Pick your avatar →" prompt on the student dashboard disappears.
4. **Unauthenticated guard** — visiting `/profile/setup` without a session should redirect to `/login?next=/profile/setup`.

**Target URL:** `/profile/setup` (already correct — no new route needed)  
**Redirect after save:** `/dashboard/student` (already implemented — keep it)

---

## Files to Create / Modify

### API

#### 1. `apps/api/src/user/dto/update-display-name.dto.ts` ← **CREATE**
```ts
import { IsString, Length } from 'class-validator';

export class UpdateDisplayNameDto {
  @IsString()
  @Length(1, 50)
  displayName!: string;
}
```

#### 2. `apps/api/src/user/user.service.ts` ← **MODIFY**
Add method `updateDisplayName(userId: string, displayName: string)`:
```ts
async updateDisplayName(userId: string, displayName: string) {
  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: { displayName },
    select: { id: true, displayName: true },
  });
  return { id: updated.id, displayName: updated.displayName };
}
```

#### 3. `apps/api/src/user/user.controller.ts` ← **MODIFY**
Add endpoint after the existing `PUT me/avatar`:
```ts
@Put('me/display-name')
@Roles(UserRole.STUDENT)
@ApiOperation({ summary: 'Update display name for the current student' })
updateDisplayName(
  @CurrentUser() user: AuthenticatedUser,
  @Body() dto: UpdateDisplayNameDto,
) {
  return this.userService.updateDisplayName(user.userId, dto.displayName);
}
```
Also import `UpdateDisplayNameDto` at the top.

#### 4. `apps/api/src/auth/auth.service.ts` ← **MODIFY**
In both `registerStudent` and `loginStudent`, update the returned `user` object to include `username`, `grade`, and `avatarSlug`:

For `registerStudent` (around line 136):
```ts
return {
  access_token: this.jwtService.sign(payload),
  expires_in: 3600,
  user: {
    id: student.id,
    role: 'student',
    name: student.displayName,
    username: student.username ?? undefined,
    grade: student.grade ?? undefined,
    avatarSlug: student.avatarSlug ?? null,
  },
};
```
Also update the Prisma `create` select to include `avatarSlug`:
```ts
const student = await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { ... },
    select: { id: true, displayName: true, username: true, grade: true, avatarSlug: true },
  });
  ...
  return user;
});
```

For `loginStudent` (around line 170):
```ts
return {
  access_token,
  expires_in: 3600,
  user: {
    id: user.id,
    role: 'student',
    name: user.displayName,
    username: user.username ?? undefined,
    grade: user.grade ?? undefined,
    avatarSlug: user.avatarSlug ?? null,
  },
};
```
The Prisma `findUnique` in `loginStudent` already returns all fields by default (no `select` specified), so this just needs the return shape updated.

**Also update the `AuthResult` interface** at the top of `auth.service.ts`:
```ts
export interface AuthResult {
  access_token: string;
  expires_in: number;
  user: {
    id: string;
    role: string;
    email?: string;
    name: string;
    username?: string;
    grade?: number;
    avatarSlug?: string | null;
  };
}
```

### Web

#### 5. `apps/web/src/components/providers/auth-provider.tsx` ← **MODIFY**
Add an `updateUser` function to `AuthContextValue` that merges a partial `AuthUser` into state and localStorage:
```ts
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser, expiresIn: number) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;  // ← ADD
}
```
Implementation:
```ts
const updateUser = useCallback((partial: Partial<AuthUser>) => {
  setUser((prev) => {
    if (!prev) return prev;
    const updated = { ...prev, ...partial };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  });
}, []);
```
Wire it into the context value and default.

#### 6. `apps/web/src/lib/api.ts` ← **MODIFY**
Add `updateDisplayName` function:
```ts
export async function updateDisplayName(
  displayName: string,
  token: string,
): Promise<{ id: string; displayName: string }> {
  const res = await fetch(`${API_BASE}/me/display-name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName }),
  });
  return handleResponse<{ id: string; displayName: string }>(res);
}
```

#### 7. `apps/web/src/app/profile/setup/page.tsx` ← **MODIFY**
Replace the current file with an enhanced version that:

- **Imports** `updateDisplayName` from `@/lib/api` and `useEffect` from React, and the `updateUser` function from `useAuth`.
- **State**: add `displayName` state pre-filled from `user?.name ?? ''`.
- **Unauthenticated redirect**: in a `useEffect`, if `token === null` (after hydration — use a `mounted` flag), call `router.push('/login?next=/profile/setup')`.
- **On save**: call both `updateAvatar(selected, token)` and, if `displayName.trim() !== user?.name`, call `updateDisplayName(displayName.trim(), token)`. Then call `updateUser({ avatarSlug: selected, name: displayName.trim() })` to sync localStorage/context before redirecting.
- **UI**: above the avatar grid, add a "Your display name" label with an `<Input>` pre-filled with `displayName`, `maxLength={50}`.

The full revised `profile/setup/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AVATAR_MAP } from '@/components/avatar';
import { useAuth } from '@/components/providers/auth-provider';
import { updateAvatar, updateDisplayName } from '@/lib/api';

const AVATAR_SLUGS = Object.keys(AVATAR_MAP) as Array<keyof typeof AVATAR_MAP>;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setDisplayName(user?.name ?? '');
    setSelected(user?.avatarSlug ?? null);
  }, [user]);

  useEffect(() => {
    if (mounted && !token) {
      router.push('/login?next=/profile/setup');
    }
  }, [mounted, token, router]);

  async function handleSave() {
    if (!selected || !token) return;
    setSaving(true);
    setError(null);
    try {
      await updateAvatar(selected, token);
      const trimmed = displayName.trim();
      if (trimmed && trimmed !== user?.name) {
        await updateDisplayName(trimmed, token);
      }
      updateUser({ avatarSlug: selected, name: trimmed || user?.name });
      router.push('/dashboard/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Set up your profile
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Confirm your name and pick a character!
          </p>

          {/* Display name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your display name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
            />
          </div>

          {/* Avatar grid — 4 per row */}
          <p className="text-sm font-medium text-slate-700 mb-3">Choose your avatar</p>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {AVATAR_SLUGS.map((slug) => {
              const isSelected = selected === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelected(slug)}
                  className={[
                    'flex flex-col items-center gap-2 rounded-xl p-3 border-2 transition-all',
                    'hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 bg-white',
                  ].join(' ')}
                  aria-pressed={isSelected}
                  aria-label={`Select ${slug} avatar`}
                >
                  <Avatar slug={slug} size="lg" />
                  <span className="text-xs font-medium text-slate-700 capitalize">
                    {slug}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!selected || saving}
              className="flex-1"
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
            <Link
              href="/dashboard/student"
              className="text-sm text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              Skip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

| # | Criterion | How to verify |
|---|---|---|
| AC1 | `PUT /me/display-name` accepts `{ displayName }` (1–50 chars) and returns `{ id, displayName }` | curl or unit test |
| AC2 | `PUT /me/display-name` requires student JWT; returns 403 for teachers/parents | check `@Roles(UserRole.STUDENT)` guard |
| AC3 | `registerStudent` response includes `avatarSlug`, `username`, `grade` in `user` object | read `auth.service.ts` code |
| AC4 | `loginStudent` response includes `avatarSlug`, `username`, `grade` in `user` object | read `auth.service.ts` code |
| AC5 | `/profile/setup` shows a "Your display name" text input pre-filled with the student's current name | browser test |
| AC6 | Avatar grid shows all 8 slugs; selecting one highlights it with indigo border | browser test |
| AC7 | Save button calls `updateAvatar` + `updateDisplayName` (if name changed), updates auth context, redirects to `/dashboard/student` | browser test |
| AC8 | After save, the "Pick your avatar →" link on `/dashboard/student` is gone (avatarSlug in context) | browser test |
| AC9 | Visiting `/profile/setup` when unauthenticated redirects to `/login?next=/profile/setup` | browser test |
| AC10 | "Skip" link navigates to `/dashboard/student` without calling any API | code review |

---

## Gotchas

- The `updateUser` function in auth-provider uses the functional form of `setUser` — **do not** read `user` from closure inside the updater, use `prev` from the setter.
- `user?.name` in context is `displayName` from the DB (set at registration). Don't confuse with `username` (the login handle).
- The `registerStudent` Prisma `$transaction` currently returns the result of `tx.user.create(...)` without a `select` clause, so it already returns all fields. Just update the `return` shape to include them.
- No Prisma migration is needed — `avatarSlug` is already on the `User` model.
- No new module registration needed — `UserController` is already wired in `UserModule`.
- The `/profile/setup` route is **not** under `/dashboard`, so the Next.js middleware doesn't protect it. The in-page redirect with `mounted` flag handles unauthenticated access correctly on the client.
