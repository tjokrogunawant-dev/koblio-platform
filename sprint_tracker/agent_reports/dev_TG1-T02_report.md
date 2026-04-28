# Dev Report: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Implemented by:** DEV  
**Date:** 2026-04-28  
**Commit:** `26887f4`

---

## Summary

Created the standalone `/student/dashboard` route so students get a clean home screen without the teacher sidebar, extended middleware to protect the new subtree, and updated the profile setup page to redirect to the new route.

---

## Files Created

| File | Action | Description |
|---|---|---|
| `apps/web/src/app/student/layout.tsx` | Created | Pass-through layout — ensures `/student/` subtree does not inherit `dashboard/layout.tsx` |
| `apps/web/src/app/student/dashboard/page.tsx` | Created | Student home page: avatar/name header, stats card (CoinCounter + StreakBadge + XPBar), DailyChallengeCard, Practice CTA, logout button |

## Files Modified

| File | Action | Description |
|---|---|---|
| `apps/web/src/middleware.ts` | Modified | Extended `if` guard to include `pathname.startsWith('/student')`; added `'/student/:path*'` to `config.matcher` |
| `apps/web/src/app/profile/setup/page.tsx` | Modified | Changed `router.push('/dashboard/student')` → `/student/dashboard` in `handleSave`; changed `href="/dashboard/student"` → `/student/dashboard` on Skip link |

---

## Acceptance Criteria Verification

1. ✅ `/student/dashboard` uses `apps/web/src/app/student/layout.tsx` (pass-through) — not `dashboard/layout.tsx`. No teacher sidebar rendered.
2. ✅ Middleware guards `/student/:path*`: unauthenticated requests (no `koblio_session` cookie) are redirected to `/login?next=/student/dashboard`.
3. ✅ Page renders welcome header with `Avatar` component and `displayName`.
4. ✅ `getStudentProfile` is called; CoinCounter, StreakBadge, and XPBar render with profile data.
5. ✅ `DailyChallengeCard` renders; `handleStartChallenge` pushes to `/learn/problem/:id`.
6. ✅ "Practice →" link points to `/learn`.
7. ✅ "Sign Out" button calls `logout()` and pushes to `/login`.
8. ✅ `handleSave` in profile setup now pushes to `/student/dashboard`.
9. ✅ Skip `<Link>` in profile setup now points to `/student/dashboard`.

---

## Notes

- `apps/web/src/app/dashboard/student/page.tsx` was deliberately left untouched per brief (may be linked from teacher/parent progress views).
- `getStudentProfile` confirmed to call `GET /gamification/me` and return `StudentGamificationProfile` (verified in `apps/web/src/lib/api.ts:295–302`).
- `user?.grade` defaults to `1` when undefined, as required.
