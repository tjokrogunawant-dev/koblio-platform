# Dev Report: TG1-T01 — Student Profile Setup Page

**Sprint:** 19  
**Task ID:** TG1-T01  
**Date:** 2026-04-27  
**Commit:** `a0e81d2`

---

## Summary

Implemented the complete student profile setup flow: a new `PUT /me/profile` API endpoint that atomically updates display name and avatar slug, wired to a reworked `/profile/setup` page that shows a display-name input pre-filled from the auth context and the existing 8-avatar grid.

---

## Files Created

| File | Description |
|---|---|
| `apps/api/src/user/dto/update-profile.dto.ts` | New DTO — optional `displayName` (2–30 chars) and optional `avatarSlug` (validated against `VALID_AVATAR_SLUGS`) |

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/user/user.controller.ts` | Imported `UpdateProfileDto`; added `PUT me/profile` route restricted to `STUDENT` role |
| `apps/api/src/user/user.service.ts` | Imported `UpdateProfileDto`; added `updateProfile(auth0Id, dto)` method — finds user by `auth0Id`, updates both fields atomically, returns `{ id, displayName, avatarSlug }` |
| `apps/web/src/lib/api.ts` | Added `UpdateProfileResponse` interface and `updateProfile(data, token)` function that calls `PUT /me/profile` |
| `apps/web/src/components/providers/auth-provider.tsx` | Added `updateUser: (patch: Partial<AuthUser>) => void` to `AuthContextValue` interface, default context, and `AuthProvider` implementation; persists patch to localStorage |
| `apps/web/src/app/profile/setup/page.tsx` | Replaced `updateAvatar` call with `updateProfile`; added `displayName` state pre-filled from `user?.name`; added display-name text input with inline validation; added `useEffect` auth guard (`!token → /login`); Save button disabled if name < 2 chars or no avatar selected |

---

## Acceptance Criteria Checklist

1. ✅ Profile setup page shows text input pre-filled with `user?.name`
2. ✅ Inline error if name < 2 chars; Save disabled until ≥ 2 chars AND avatar selected
3. ✅ Avatar grid with 8 slugs preserved — existing behaviour unchanged
4. ✅ Save calls `PUT /me/profile` with `{ displayName, avatarSlug }` and redirects to `/dashboard/student`
5. ✅ `PUT /me/profile` persists both fields atomically via Prisma and returns `{ id, displayName, avatarSlug }`
6. ✅ `updateUser` patches `AuthContext` + localStorage so dashboard shows new name/avatar without refresh
7. ✅ Unauthenticated visit redirects to `/login` via `useEffect` guard
8. ✅ Skip link navigates to `/dashboard/student` without saving
