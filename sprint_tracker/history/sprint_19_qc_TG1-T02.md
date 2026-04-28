# QC Report: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Written by:** QA  
**Date:** 2026-04-28  
**Verdict:** PASS

---

## Files Reviewed

| File | Status |
|---|---|
| `apps/web/src/app/student/layout.tsx` | Created — reviewed |
| `apps/web/src/app/student/dashboard/page.tsx` | Created — reviewed |
| `apps/web/src/middleware.ts` | Modified — reviewed |
| `apps/web/src/app/profile/setup/page.tsx` | Modified — reviewed |
| `apps/web/src/app/dashboard/student/page.tsx` | Confirmed untouched |

---

## Acceptance Criteria Evaluation

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | `/student/dashboard` renders without teacher sidebar | PASS | `student/layout.tsx` is a pass-through (`<>{children}</>`). `/student/` is a sibling to `/dashboard/` in the route tree, so `dashboard/layout.tsx` is never in scope. |
| 2 | Unauthenticated requests redirected to `/login?next=/student/dashboard` | PASS | `middleware.ts` checks `pathname.startsWith('/student')` and sets `loginUrl.searchParams.set('next', pathname)`. Matcher includes `'/student/:path*'` as a separate entry. |
| 3 | Welcome header shows Avatar + display name | PASS | `<Avatar slug={user?.avatarSlug} size="lg" name={displayName} />` rendered alongside `Welcome back, {displayName}!`. Fallback chain `username → name → 'Student'` correct. |
| 4 | Stats card shows CoinCounter, StreakBadge, XPBar with correct values | PASS | All three components wired to `profile.coins`, `profile.streakCount`, `profile.xp / level / levelInfo` fields. Loading state and null guard both correct. |
| 5 | DailyChallengeCard renders; "Start" navigates to `/learn/problem/:id` | PASS | `<DailyChallengeCard problem={dailyChallenge} grade={grade} onStart={handleStartChallenge} />` present. `handleStartChallenge` pushes `/learn/problem/${dailyChallenge.id}`. |
| 6 | "Practice →" button links to `/learn` | PASS | `<Link href="/learn" ...>Practice →</Link>` confirmed at JSX line 107–113. |
| 7 | "Sign Out" logs out and redirects to `/login` | PASS | `handleLogout` calls `logout()` then `router.push('/login')`. Button is correctly wired via `onClick={handleLogout}`. |
| 8 | Profile setup `handleSave` redirects to `/student/dashboard` | PASS | `profile/setup/page.tsx` line 38: `router.push('/student/dashboard')`. |
| 9 | Profile setup Skip link points to `/student/dashboard` | PASS | `profile/setup/page.tsx` line 117: `<Link href="/student/dashboard" ...>Skip</Link>`. |

---

## Additional Checks

- **`dashboard/student/page.tsx` untouched:** Confirmed — the existing richer student view (with BadgeShelf, assignments table, leaderboard link) is intact and available for teacher/parent progress views as intended.
- **API imports verified:** `getStudentProfile`, `getDailyChallenge`, `StudentGamificationProfile`, and `Problem` are all properly exported from `apps/web/src/lib/api.ts`. Type shapes match the props used in the page.
- **`user?.grade ?? 1` default:** Applied correctly on line 29 of the new page.
- **Middleware matcher format:** Two separate strings in the array (`'/dashboard/:path*'` and `'/student/:path*'`) — correct per the brief's gotcha note.
- **Client-side auth guard:** Token-absent redirect `useEffect` present as a belt-and-suspenders guard alongside the cookie-based middleware check.

---

## Notable But Insubstantial Issues

None identified.

---

## Summary

All 9 acceptance criteria pass. Implementation is a precise match to the brief. No regressions detected in modified files. The old `/dashboard/student` route remains untouched. Verdict: **PASS**.
