# Dev Report: TG1-T01 — Student Profile Setup Page

**Sprint:** 19  
**Task ID:** TG1-T01  
**Implemented by:** DEV agent  
**Date:** 2026-04-27  
**Commit:** `4c23f8a`

---

## Files Created

| File | Description |
|---|---|
| `apps/api/src/user/dto/update-profile.dto.ts` | New DTO — optional `displayName` (2–30 chars) and `avatarSlug` (validated against `VALID_AVATAR_SLUGS`) |

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/user/user.controller.ts` | Added `PUT /me/profile` route (STUDENT role, uses `UpdateProfileDto`) |
| `apps/api/src/user/user.service.ts` | Added `updateProfile()` method — `findUnique` by `auth0Id`, atomic `update` of `displayName` and/or `avatarSlug`, returns `{ id, displayName, avatarSlug }` |
| `apps/web/src/lib/api.ts` | Added `UpdateProfileResponse` interface and `updateProfile()` fetch function (`PUT /me/profile`) |
| `apps/web/src/components/providers/auth-provider.tsx` | Added `updateUser: (patch: Partial<AuthUser>) => void` to `AuthContextValue` interface, default context, and provider implementation |
| `apps/web/src/app/profile/setup/page.tsx` | Full rewrite: display name input pre-filled from `user?.name`, inline validation (min 2 chars), auth guard (`useEffect` → `/login`), Save calls `updateProfile()` then `updateUser()`, Skip unchanged |

## Acceptance Criteria Check

1. ✅ Display name input pre-filled from `user?.name ?? ''`
2. ✅ Inline error shown when 1 char; Save disabled until ≥ 2 chars and avatar selected
3. ✅ Avatar 8-slug grid preserved
4. ✅ Save calls `PUT /me/profile` with `{ displayName, avatarSlug }`, redirects to `/dashboard/student`
5. ✅ Backend atomically updates both fields, returns `{ id, displayName, avatarSlug }`
6. ✅ `updateUser()` patches AuthContext + localStorage so dashboard reflects changes without refresh
7. ✅ Unauthenticated visits trigger `router.push('/login')` via `useEffect`
8. ✅ Skip link navigates to `/dashboard/student` without saving

## Notes

- Did not modify `PUT /me/avatar` — preserved as-is per brief gotcha
- The `auth0Id` column naming convention followed exactly (same as `updateAvatar` and `getStudentProfileByAuth0Id`)
- `AuthUser.name` ↔ API `displayName` mapping handled in `updateUser({ name: result.displayName })`
