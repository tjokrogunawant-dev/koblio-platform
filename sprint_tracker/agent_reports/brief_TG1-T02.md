# Implementation Brief: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Written by:** PM  
**Date:** 2026-04-27  

---

## Context

The student home dashboard at `/dashboard/student` was implemented as part of Sprint 10 (P2-T04, commit `6b087e2`) and has been in place since then. The sprint-19 task description notes "currently no home screen after login" — that was stale at the time Sprint 19 was drafted. The page exists and is wired correctly:

- Post-login redirect (student role): `apps/web/src/app/login/login-form.tsx:25` → `'/dashboard/student'`
- Post-profile-setup redirect: `apps/web/src/app/profile/setup/page.tsx` → `router.push('/dashboard/student')`

**DEV task:** Verify the existing implementation satisfies all 5 acceptance criteria below. If any criterion is unmet, implement the fix. If all pass, write the report marking the task done.

---

## What to Build

No new files required. DEV should read the following files and verify each acceptance criterion:

| File | Purpose |
|---|---|
| `apps/web/src/app/dashboard/student/page.tsx` | Main dashboard page — all criteria land here |
| `apps/web/src/lib/api.ts` | Client-side API functions called by the page |
| `apps/web/src/app/login/login-form.tsx` | Post-login redirect for student role |

---

## Acceptance Criteria

| # | Criterion | Where to verify |
|---|---|---|
| AC1 | XP bar visible on dashboard — shows current level, XP to next level, and progress percent | `XPBar` component rendered when `profile` is non-null; fed by `getStudentProfile()` → `profile.levelInfo` |
| AC2 | Coin counter visible on dashboard | `CoinCounter` rendered with `profile.coins` |
| AC3 | Streak widget visible on dashboard | `StreakBadge` rendered with `profile.streakCount` |
| AC4 | "Today's Challenge" card visible — shows grade-appropriate problem or empty state | `DailyChallengeCard` rendered; `getDailyChallenge(grade)` called with user's grade |
| AC5 | "Practice" / "Start Learning" button links to topic browser (`/learn`) | `<Link href="/learn">` present (the "🚀 Start Learning" CTA) |
| AC6 | Student role post-login redirects to `/dashboard/student` | `roleRedirects.student === '/dashboard/student'` in `login-form.tsx` |
| AC7 | Unauthenticated visit redirects to `/login` | Auth guard present — `if (!token) router.push('/login')` |

---

## Gotchas

- The canonical route is `/dashboard/student` (under the `dashboard/` Next.js segment), **not** `/student/dashboard`. The sprint description used the wrong path — do not create a `/student/dashboard` route.
- The dashboard does **not** include an inline `LeaderboardWidget` — it shows a "View Leaderboard →" link to `/dashboard/student/leaderboard`. This is intentional and acceptable for Trial Gate 1.
- Stats row is conditionally rendered (`{(profile || loadingProfile) && ...}`) — if the API is unreachable the stats section is hidden entirely, not blank. This is correct graceful degradation behaviour.
- The `grade` field comes from `user?.grade ?? 1`; students registered via class code must have `grade` on the JWT payload or the daily challenge defaults to Grade 1 problems.

---

## No New Files Required

If all 7 criteria pass on the existing code, DEV writes a verification report and marks the task done. No code changes needed.

If any criterion fails, implement the minimal fix in the relevant file only.
