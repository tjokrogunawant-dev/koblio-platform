# Brief: TG1-T02 — Student Home Dashboard

**Sprint:** 19  
**Task ID:** TG1-T02  
**Written by:** PM  
**Date:** 2026-04-27

---

## Context

After TG1-T01 a student who completes profile setup is redirected to `/dashboard/student`. That page exists and has all required gamification components (XPBar, CoinCounter, StreakBadge, DailyChallengeCard). However it lives inside `apps/web/src/app/dashboard/` which applies `dashboard/layout.tsx` — a layout that renders a `DashboardSidebar` designed for teachers. Students see a teacher sidebar alongside their home screen, which is broken UX.

The solution is to create a clean standalone student home at `/student/dashboard` (outside the `/dashboard/` layout tree), then update the profile setup redirect to point there. The middleware must also be extended to protect `/student/:path*` with the session cookie check.

---

## What to Build

### 1. `apps/web/src/app/student/layout.tsx` — NEW

A minimal pass-through layout so the `/student/` subtree does **not** inherit `dashboard/layout.tsx`. The root layout already provides `AuthProvider` and `QueryClientProvider`.

```tsx
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

### 2. `apps/web/src/app/student/dashboard/page.tsx` — NEW

A `'use client'` page. Model it on `apps/web/src/app/dashboard/student/page.tsx` but simplified: only the components listed in the acceptance criteria (no badge shelf, no assignments table — those are for later).

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar } from '@/components/avatar';
import { CoinCounter } from '@/components/gamification/coin-counter';
import { XPBar } from '@/components/gamification/xp-bar';
import { StreakBadge } from '@/components/gamification/streak-badge';
import { DailyChallengeCard } from '@/components/gamification/daily-challenge-card';
import {
  getStudentProfile,
  getDailyChallenge,
  type StudentGamificationProfile,
  type Problem,
} from '@/lib/api';

export default function StudentHomePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [profile, setProfile] = useState<StudentGamificationProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<Problem | null>(null);

  const displayName = user?.username ?? user?.name ?? 'Student';
  const grade = user?.grade ?? 1;

  // Client-side auth guard — middleware covers the cookie path but this handles
  // the case where the cookie exists but localStorage token is cleared.
  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    setLoadingProfile(true);
    void getStudentProfile(token)
      .then((p) => setProfile(p))
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [token]);

  useEffect(() => {
    void getDailyChallenge(grade).then((p) => setDailyChallenge(p)).catch(() => {});
  }, [grade]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function handleStartChallenge() {
    if (dailyChallenge) router.push(`/learn/problem/${dailyChallenge.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-xl font-bold text-indigo-600">Koblio</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-8">
        {/* Welcome row */}
        <div className="flex items-center gap-4">
          <Avatar slug={user?.avatarSlug} size="lg" name={displayName} />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, {displayName}!
            </h1>
            <p className="mt-1 text-slate-500">Grade {grade}</p>
          </div>
        </div>

        {/* Stats card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {loadingProfile && !profile ? (
            <p className="text-sm text-slate-400">Loading stats…</p>
          ) : profile ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                <CoinCounter coins={profile.coins} animated />
                <StreakBadge streakCount={profile.streakCount} />
              </div>
              <XPBar
                xp={profile.xp}
                level={profile.level}
                xpToNextLevel={profile.levelInfo.xpToNextLevel}
                progressPercent={profile.levelInfo.progressPercent}
              />
            </div>
          ) : null}
        </div>

        {/* Daily Challenge */}
        <DailyChallengeCard
          problem={dailyChallenge}
          grade={grade}
          onStart={handleStartChallenge}
        />

        {/* Practice CTA */}
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Practice →
          </Link>
        </div>
      </main>
    </div>
  );
}
```

### 3. `apps/web/src/middleware.ts` — MODIFY

Extend the existing middleware to also guard `/student/:path*`. Add a second `startsWith` check and update the matcher:

```ts
import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/student')) {
    const session = request.cookies.get('koblio_session');
    if (!session?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/student/:path*'],
};
```

### 4. `apps/web/src/app/profile/setup/page.tsx` — MODIFY

Update the two references to `/dashboard/student` so the student lands on the new home after setup:

- Line in `handleSave`: change `router.push('/dashboard/student')` → `router.push('/student/dashboard')`
- Skip `<Link href="/dashboard/student"` → `href="/student/dashboard"`

No other logic changes — do not alter the form, validation, or API call.

---

## Acceptance Criteria

1. `GET /student/dashboard` renders without the teacher sidebar — it uses the standalone layout, not `dashboard/layout.tsx`.
2. A student who is not logged in (no `koblio_session` cookie) is redirected to `/login?next=/student/dashboard` by the middleware.
3. The page displays a welcome header with the student's avatar and display name.
4. When the API returns profile data, the page shows a coin count (CoinCounter), a streak count (StreakBadge), and an XP bar (XPBar) with correct values.
5. A DailyChallengeCard renders. Clicking "Start" navigates to `/learn/problem/:id`.
6. A "Practice →" button links to `/learn` (the topic browser).
7. "Sign Out" logs out and redirects to `/login`.
8. Completing profile setup (`/profile/setup`) now redirects to `/student/dashboard`, not `/dashboard/student`.
9. The "Skip" link on the profile setup page now points to `/student/dashboard`.

---

## Gotchas

- The `apps/web/src/app/student/layout.tsx` file is required even if it is a pass-through. Without it, Next.js will apply the nearest ancestor layout, which could be the root layout (fine) but we need to ensure it does NOT traverse up and use `dashboard/layout.tsx`. Since `/student/` is a sibling to `/dashboard/`, it won't inherit the dashboard layout anyway — but adding the explicit layout makes the intent clear and guards against future rearrangement.
- `getStudentProfile` already calls `GET /gamification/me` (check `apps/web/src/lib/api.ts` to confirm the function name and return type before wiring it up).
- Do NOT remove or modify `apps/web/src/app/dashboard/student/page.tsx` — it may be linked from the teacher/parent progress views. Only add the new route.
- The middleware `matcher` array must include both entries as separate strings; combining them into one glob pattern would break the existing dashboard protection.
- `user?.grade` may be `undefined` for users who haven't set a grade — default to `1` (already shown in the code snippet above).
