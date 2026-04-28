# Dev Report: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Written by:** DEV  
**Date:** 2026-04-28  
**Commit:** 118bf6c

---

## Summary

Implemented the standalone student home dashboard at `/student/dashboard`, isolated from the teacher sidebar layout. Extended middleware to protect the `/student/*` subtree, and updated profile setup redirects.

---

## Files Created

| File | Description |
|---|---|
| `apps/web/src/app/student/layout.tsx` | Pass-through layout — prevents `/student/*` from inheriting `dashboard/layout.tsx` (teacher sidebar) |
| `apps/web/src/app/student/dashboard/page.tsx` | Student home page: Avatar welcome header, CoinCounter, StreakBadge, XPBar stats card, DailyChallengeCard, Practice → link, Sign Out button |

## Files Modified

| File | Change |
|---|---|
| `apps/web/src/middleware.ts` | Added `pathname.startsWith('/student')` check; added `'/student/:path*'` to matcher array |
| `apps/web/src/app/profile/setup/page.tsx` | Updated `router.push('/dashboard/student')` → `router.push('/student/dashboard')` (handleSave); updated Skip `href` from `/dashboard/student` → `/student/dashboard` |

---

## Acceptance Criteria Checklist (self-assessment)

1. ✅ `/student/dashboard` renders without teacher sidebar — uses `StudentLayout` (pass-through), not `dashboard/layout.tsx`
2. ✅ Middleware now guards `/student/:path*` — redirects unauthenticated requests to `/login?next=/student/dashboard`
3. ✅ Welcome header shows Avatar + display name (falls back to `username` → `name` → `'Student'`)
4. ✅ Stats card shows CoinCounter, StreakBadge, XPBar from `getStudentProfile` response
5. ✅ DailyChallengeCard renders; `handleStartChallenge` pushes to `/learn/problem/:id`
6. ✅ "Practice →" link points to `/learn`
7. ✅ "Sign Out" calls `logout()` and pushes to `/login`
8. ✅ `handleSave` in profile setup now redirects to `/student/dashboard`
9. ✅ Skip link in profile setup now points to `/student/dashboard`

---

## Notes

- `apps/web/src/app/dashboard/student/page.tsx` intentionally not modified — it remains for teacher/parent progress views.
- `getDailyChallenge` returns `Problem | null`; the `.catch(() => {})` guard handles backend unavailability gracefully.
- `user?.grade ?? 1` default applied as specified.
