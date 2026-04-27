# Brief: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Written by:** PM  
**Date:** 2026-04-27

---

## Context

The student home dashboard is **already implemented** at `apps/web/src/app/dashboard/student/page.tsx`. It was built during earlier sprint work (S06–S09) and contains all the required UI components. The sprint task was written before this work was delivered.

What TG1-T02 still requires:

1. **Verification** that every acceptance criterion below is fully satisfied by the existing page.
2. **One small gap:** the Next.js middleware at `apps/web/src/middleware.ts` already appends `?next=<path>` to the `/login` redirect when a user hits `/dashboard/*` without a session, but `apps/web/src/app/login/login-form.tsx` ignores that parameter — students are always sent to the default role redirect. Add `?next` handling so mid-session expiry sends the student back to the page they were trying to reach.

---

## What to Build / Verify

### 1. Verify `apps/web/src/app/dashboard/student/page.tsx`

Confirm the following are present and wired correctly (they should be — fix anything broken):

- `CoinCounter` from `@/components/gamification/coin-counter` — displays `profile.coins`
- `XPBar` from `@/components/gamification/xp-bar` — displays `profile.xp`, `profile.level`, `profile.levelInfo.xpToNextLevel`, `profile.levelInfo.progressPercent`
- `StreakBadge` from `@/components/gamification/streak-badge` — displays `profile.streakCount`
- `DailyChallengeCard` from `@/components/gamification/daily-challenge-card` — shows today's problem; tapping it navigates to `/learn/problem/:id`
- A clearly labelled CTA (currently "🚀 Start Learning") that links to `/learn` (the topic browser)

Do **not** add new features beyond what is listed.

### 2. Add `?next` redirect handling to `apps/web/src/app/login/login-form.tsx`

Read the `next` search param after login. If it points to a `/dashboard/*` path, redirect there instead of the default role redirect.

Add near the top of the component body:

```tsx
import { useSearchParams } from 'next/navigation';

// Inside LoginForm:
const searchParams = useSearchParams();
const nextPath = searchParams.get('next');
```

Update the post-login redirect logic:

```tsx
const defaultRedirect = roleRedirects[result.user.role];
const redirect =
  nextPath && nextPath.startsWith('/dashboard')
    ? nextPath
    : defaultRedirect;
router.push(redirect);
```

`LoginForm` is already a `'use client'` component. `useSearchParams()` requires a Suspense boundary in Next.js 15 App Router. Check `apps/web/src/app/login/page.tsx` — if `LoginForm` is rendered without a `<Suspense>` wrapper, add one:

```tsx
// apps/web/src/app/login/page.tsx
import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
```

---

## Files to Modify

| File | Change |
|---|---|
| `apps/web/src/app/dashboard/student/page.tsx` | Review only — fix any rendering bugs; no new additions |
| `apps/web/src/app/login/login-form.tsx` | Add `useSearchParams`, handle `?next` redirect |
| `apps/web/src/app/login/page.tsx` | Wrap `LoginForm` in `<Suspense>` if not already present |

---

## Acceptance Criteria

1. `/dashboard/student` shows the student's coin count, XP bar with level and progress, and streak count — all sourced from `GET /gamification/me`.
2. A "Today's Challenge" card is visible; clicking it navigates to `/learn/problem/:id` for the correct daily challenge problem.
3. A "Start Learning" / "Practice" CTA is present and links to `/learn` (the topic browser).
4. Student login (username + password tab) redirects to `/dashboard/student` by default.
5. If the middleware has set `?next=/dashboard/student/leaderboard` (or any `/dashboard/*` path), the login form redirects there after successful login instead of the default.
6. Unauthenticated visits to `/dashboard/student` redirect to `/login` (handled by middleware — verify end-to-end).

---

## Gotchas

- `useSearchParams()` is a client-side hook that triggers a Suspense boundary requirement in Next.js 15 App Router. Always wrap the consuming component in `<Suspense>` in the parent server component to avoid a build warning or runtime error.
- Only trust `?next` values that start with `/dashboard` — never redirect to arbitrary external URLs (open-redirect prevention).
- The `koblio_session` cookie is a presence flag set by `auth-provider.tsx` during login; the middleware reads it. Do not change cookie or middleware logic.
- Do NOT create a new `/student/dashboard` route. The canonical URL is `/dashboard/student` and the login form already uses it.
