# Brief: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Written by:** PM  
**Date:** 2026-04-27

---

## Context

The student home dashboard at `apps/web/src/app/dashboard/student/page.tsx` (216 lines) already exists and is largely feature-complete. It renders:

- Avatar + welcome row with display name
- Stats row: `CoinCounter`, `StreakBadge`, `XPBar` (from `GET /gamification/me`)
- `DailyChallengeCard` (from `GET /gamification/daily-challenge/:grade`)
- "Start Learning" CTA → `/learn` (the topic browser)
- `BadgeShelf` (from `GET /badges/me`)
- Assignments table (from `GET /assignments/student`)

The `/learn` topic browser also exists and is complete (grade → strand → topic → problem list).

**Two gaps remain for Trial Gate 1:**

1. **No client-side auth guard** — There is no `useEffect` redirect for unauthenticated users. The middleware guards the route via cookie, but during React hydration there is a brief window where an unauthenticated user sees the shell before the cookie check fires. This causes the same hydration flash flagged as an NBI in TG1-T01 QA.

2. **No first-time avatar redirect** — The dashboard shows a plain text link ("Pick your avatar →") if the student hasn't set an avatar. For Trial Gate 1 UX, a student who has never set an avatar should be redirected to `/profile/setup` automatically on mount, not left on the dashboard with an empty avatar. After they complete profile setup they come back to the dashboard normally.

---

## What to Build

### 1. `apps/web/src/app/dashboard/student/page.tsx` — MODIFY only

Make two targeted additions inside `StudentDashboardPage`. Do not change any rendering logic beyond these two effects.

**Addition 1 — Auth guard** (insert immediately after the `const grade = ...` line, before the existing `useEffect` block):

```ts
useEffect(() => {
  if (!token) router.push('/login');
}, [token, router]);
```

**Addition 2 — First-time avatar redirect** (insert directly after the auth guard effect):

```ts
useEffect(() => {
  if (token && user && !user.avatarSlug) {
    router.push('/profile/setup');
  }
}, [token, user, router]);
```

Both effects depend on `token` and/or `user`, which are already in scope. No new imports are needed — `useEffect`, `useRouter`, and `useAuth` are already imported.

---

## Acceptance Criteria

1. Visiting `/dashboard/student` while unauthenticated (no token in localStorage / expired token) redirects to `/login`.
2. A student who is authenticated but has `user.avatarSlug === null` is redirected to `/profile/setup` on mount.
3. A student who is authenticated and has `user.avatarSlug` set sees the full dashboard (no redirect).
4. All existing dashboard content — XP bar, coin counter, streak badge, daily challenge card, "Start Learning" CTA, badge shelf, assignments table — renders correctly and is not broken by the changes.
5. The "Start Learning" link navigates to `/learn` (the grade → topic browser).

---

## Gotchas

- The auth guard should redirect on `!token`, not `!user`. The `user` object from localStorage can momentarily be null even when `token` is present during hydration; triggering a redirect on `!user` causes a false redirect for a valid session.
- The avatar redirect uses `token && user && !user.avatarSlug` so it does not fire before the auth state is rehydrated from localStorage (which happens in the `AuthProvider`'s own `useEffect`). This correctly defers the redirect until the session is confirmed.
- Do NOT remove the existing `{!user?.avatarSlug && <Link href="/profile/setup">…</Link>}` prompt in the welcome row. The redirect fires before the user sees the dashboard, but the link serves as a fallback for the edge case where `user` rehydrates mid-render.
- The changes are two `useEffect` hooks — no new API calls, no new state, no new imports.
