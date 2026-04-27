# Dev Report: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Author:** DEV agent  
**Date:** 2026-04-27  
**Commit:** `8c2c9b0`

---

## Summary

Implemented a standalone student home at `/student/dashboard`, outside the `/dashboard/` layout tree so the teacher sidebar is never rendered for students. Extended middleware to protect the new route, and updated profile setup to redirect there on save/skip.

---

## Files Created

| File | Description |
|---|---|
| `apps/web/src/app/student/layout.tsx` | Minimal pass-through layout — prevents `/student/` from inheriting `dashboard/layout.tsx` |
| `apps/web/src/app/student/dashboard/page.tsx` | New student home: welcome header (avatar + display name), stats card (CoinCounter, StreakBadge, XPBar), DailyChallengeCard, Practice → link, Sign Out |

## Files Modified

| File | Change |
|---|---|
| `apps/web/src/middleware.ts` | Added `\|\| pathname.startsWith('/student')` to the auth guard condition; added `'/student/:path*'` to the `matcher` array |
| `apps/web/src/app/profile/setup/page.tsx` | `router.push` in `handleSave` changed from `/dashboard/student` → `/student/dashboard`; Skip `<Link href>` changed from `/dashboard/student` → `/student/dashboard` |

---

## Acceptance Criteria — DEV Self-Check

| # | Criterion | Status |
|---|---|---|
| 1 | `/student/dashboard` uses standalone layout, not teacher sidebar | ✅ `student/layout.tsx` is a sibling to `dashboard/` — no sidebar |
| 2 | Unauthenticated request redirected to `/login?next=/student/dashboard` by middleware | ✅ Middleware extended with `/student` startsWith check + matcher entry |
| 3 | Welcome header shows avatar + display name | ✅ `<Avatar>` + `<h1>Welcome back, {displayName}!` rendered |
| 4 | CoinCounter, StreakBadge, XPBar shown with API data | ✅ `getStudentProfile` wired, displayed in stats card |
| 5 | DailyChallengeCard renders; "Start" navigates to `/learn/problem/:id` | ✅ `getDailyChallenge` wired; `handleStartChallenge` pushes to correct path |
| 6 | "Practice →" links to `/learn` | ✅ `<Link href="/learn">` present |
| 7 | "Sign Out" logs out and redirects to `/login` | ✅ `handleLogout` calls `logout()` + `router.push('/login')` |
| 8 | Profile setup `handleSave` now redirects to `/student/dashboard` | ✅ `router.push('/student/dashboard')` |
| 9 | Profile setup Skip link points to `/student/dashboard` | ✅ `href="/student/dashboard"` |

---

## Notes

- `apps/web/src/app/dashboard/student/page.tsx` was NOT modified — preserved for any teacher/parent progress links.
- `getStudentProfile` and `getDailyChallenge` function signatures confirmed in `apps/web/src/lib/api.ts` before wiring.
- Pre-existing `tsc --noEmit` errors in the monorepo (missing `@koblio/typescript-config` package, deprecated `baseUrl`) are unrelated to this task.
