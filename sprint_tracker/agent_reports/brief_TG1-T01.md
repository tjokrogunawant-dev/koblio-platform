# Brief: TG1-T01 — Student Profile Setup Page

**Sprint:** 19  
**Task ID:** TG1-T01  
**Written by:** PM  
**Date:** 2026-04-27

---

## Context

The page at `apps/web/src/app/profile/setup/page.tsx` already exists (100 lines). It handles avatar selection (8 slugs, 4-column grid, Save + Skip) and redirects to `/dashboard/student`. The student dashboard also exists at `apps/web/src/app/dashboard/student/page.tsx`.

The **one missing piece** is the display-name confirmation step specified in the sprint task: the student should be able to review and optionally edit their display name on this same page before saving. Currently, nothing on the platform lets a student update their display name post-registration.

---

## What to Build

### 1. `apps/api/src/user/dto/update-profile.dto.ts` — NEW

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { VALID_AVATAR_SLUGS, AvatarSlug } from './update-avatar.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  displayName?: string;

  @ApiPropertyOptional({ example: 'fox', enum: VALID_AVATAR_SLUGS })
  @IsOptional()
  @IsString()
  @IsIn(VALID_AVATAR_SLUGS)
  avatarSlug?: AvatarSlug;
}
```

### 2. `apps/api/src/user/user.controller.ts` — ADD one route

Import `UpdateProfileDto`. Add after the existing `PUT /me/avatar` route:

```ts
@Put('me/profile')
@Roles(UserRole.STUDENT)
@ApiOperation({ summary: 'Update student display name and/or avatar' })
updateProfile(
  @CurrentUser() user: AuthenticatedUser,
  @Body() dto: UpdateProfileDto,
) {
  return this.userService.updateProfile(user.userId, dto);
}
```

### 3. `apps/api/src/user/user.service.ts` — ADD one method

Add below `updateAvatar()`. Follow the same `auth0Id` lookup pattern:

```ts
async updateProfile(auth0Id: string, dto: UpdateProfileDto) {
  const user = await this.prisma.user.findUnique({ where: { auth0Id } });
  if (!user) throw new NotFoundException('User not found');

  const data: { displayName?: string; avatarSlug?: string } = {};
  if (dto.displayName !== undefined) data.displayName = dto.displayName;
  if (dto.avatarSlug !== undefined) data.avatarSlug = dto.avatarSlug;

  const updated = await this.prisma.user.update({ where: { id: user.id }, data });
  return {
    id: updated.id,
    displayName: updated.displayName,
    avatarSlug: updated.avatarSlug,
  };
}
```

Import `UpdateProfileDto` at the top of the service.

### 4. `apps/web/src/lib/api.ts` — ADD interface + function

Add an `UpdateProfileResponse` interface and `updateProfile` function near `updateAvatar`:

```ts
export interface UpdateProfileResponse {
  id: string;
  displayName: string;
  avatarSlug: string | null;
}

export async function updateProfile(
  data: { displayName?: string; avatarSlug?: string },
  token: string,
): Promise<UpdateProfileResponse> {
  const res = await fetch(`${API_BASE}/me/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UpdateProfileResponse>(res);
}
```

### 5. `apps/web/src/components/providers/auth-provider.tsx` — ADD `updateUser`

Add `updateUser: (patch: Partial<AuthUser>) => void` to `AuthContextValue` and implement it:

```ts
// In AuthContextValue interface:
updateUser: (patch: Partial<AuthUser>) => void;

// In AuthProvider, add alongside login/logout:
const updateUser = useCallback((patch: Partial<AuthUser>) => {
  setUser((prev) => {
    if (!prev) return prev;
    const updated = { ...prev, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  });
}, []);

// Add to context value:
<AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
```

Default value in `createContext` for `updateUser` should be `() => undefined`.

### 6. `apps/web/src/app/profile/setup/page.tsx` — MODIFY

Replace the current implementation:

- Import `updateProfile` instead of `updateAvatar` from `@/lib/api`
- Get `updateUser` from `useAuth()`
- Add a `displayName` state pre-filled from `user?.name ?? ''`
- Add auth guard: redirect to `/login` if no token on mount
- Add a display name text input **above** the avatar grid
- Replace the `handleSave` call to use `updateProfile`, then call `updateUser`, then redirect

Key additions to `handleSave`:
```ts
const result = await updateProfile(
  { displayName: displayName.trim(), avatarSlug: selected ?? undefined },
  token,
);
updateUser({ name: result.displayName, avatarSlug: result.avatarSlug ?? undefined });
router.push('/dashboard/student');
```

Input element to add above the avatar grid:
```tsx
<div className="mb-6">
  <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
    Your name
  </label>
  <input
    id="displayName"
    type="text"
    value={displayName}
    onChange={(e) => setDisplayName(e.target.value)}
    maxLength={30}
    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    placeholder="Enter your display name"
  />
  {displayName.trim().length > 0 && displayName.trim().length < 2 && (
    <p className="mt-1 text-xs text-red-500">Name must be at least 2 characters.</p>
  )}
</div>
```

The Save button should be disabled if `displayName.trim().length < 2` (in addition to the existing `!selected` check).

Auth guard (add at top of component body, after state declarations):
```ts
useEffect(() => {
  if (!token) router.push('/login');
}, [token, router]);
```

---

## Acceptance Criteria

1. Profile setup page shows a text input pre-filled with the student's display name (`user?.name`)
2. Student can edit the name; inline error shown if fewer than 2 characters; Save button disabled until ≥ 2 chars and an avatar is selected
3. Student can pick an avatar from the 8-slug grid — existing behaviour preserved
4. Clicking "Save" calls `PUT /me/profile` with `{ displayName, avatarSlug }` and redirects to `/dashboard/student`
5. `PUT /me/profile` persists both fields atomically and returns `{ id, displayName, avatarSlug }`
6. After save, `AuthContext` user object and localStorage reflect the new name and avatar (dashboard shows them without a refresh)
7. Unauthenticated visit to `/profile/setup` redirects to `/login`
8. "Skip" link still navigates to `/dashboard/student` without saving

---

## Gotchas

- The `user.userId` passed to service methods maps to the `auth0Id` column (legacy naming from Auth0 migration) — follow the same `findUnique({ where: { auth0Id } })` pattern already in `updateAvatar` and `getStudentProfileByAuth0Id`.
- `AuthUser.name` on the frontend is what the API calls `displayName` — when calling `updateUser`, map `result.displayName` → `name`.
- Do NOT modify or remove the existing `PUT /me/avatar` endpoint — it may still be in use elsewhere.
- The Next.js middleware only guards `/dashboard/:path*` — it does not protect `/profile/setup`, hence the explicit `useEffect` redirect.
- Import `UpdateProfileDto` in both `user.controller.ts` and `user.service.ts`.
