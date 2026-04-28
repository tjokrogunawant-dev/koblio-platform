# Dev Report: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Date:** 2026-04-28  
**Commit:** `d99ad8a`

---

## Summary

Implemented the `/student/dashboard` route as a standalone page outside the teacher sidebar layout tree. Extended middleware to guard the new route, and updated profile setup to redirect there.

---

## Files Created

| File | Notes |
|---|---|
| `apps/web/src/app/student/layout.tsx` | Pass-through layout; ensures `/student/` subtree does not inherit `dashboard/layout.tsx` |
| `apps/web/src/app/student/dashboard/page.tsx` | `'use client'` page with avatar/welcome header, stats card (CoinCounter + StreakBadge + XPBar), DailyChallengeCard, Practice link, Sign Out button |

## Files Modified

| File | Change |
|---|---|
| `apps/web/src/middleware.ts` | Added `pathname.startsWith('/student')` to auth check; added `'/student/:path*'` to matcher array |
| `apps/web/src/app/profile/setup/page.tsx` | Changed `router.push('/dashboard/student')` → `router.push('/student/dashboard')` and `href="/dashboard/student"` → `href="/student/dashboard"` on Skip link |

---

## Acceptance Criteria Checklist (self-assessed)

| # | Criterion | Status |
|---|---|---|
| 1 | `/student/dashboard` renders without teacher sidebar — uses standalone layout | PASS |
| 2 | Unauthenticated visitor redirected to `/login?next=/student/dashboard` by middleware | PASS |
| 3 | Page displays welcome header with avatar and display name | PASS |
| 4 | CoinCounter, StreakBadge, XPBar shown when API returns profile data | PASS |
| 5 | DailyChallengeCard renders; Start navigates to `/learn/problem/:id` | PASS |
| 6 | "Practice →" button links to `/learn` | PASS |
| 7 | "Sign Out" logs out and redirects to `/login` | PASS |
| 8 | Completing profile setup redirects to `/student/dashboard` | PASS |
| 9 | Skip link on profile setup points to `/student/dashboard` | PASS |

---

## Notes

- `getStudentProfile` and `getDailyChallenge` confirmed in `apps/web/src/lib/api.ts` before wiring.
- `apps/web/src/app/dashboard/student/page.tsx` left untouched per brief gotchas.
- Client-side `useEffect` auth guard handles the case where cookie exists but localStorage token is cleared.
