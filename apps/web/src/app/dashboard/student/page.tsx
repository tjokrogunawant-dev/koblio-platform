'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
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

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [profile, setProfile] = useState<StudentGamificationProfile | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<Problem | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const displayName = user?.username ?? user?.name ?? 'Student';
  const grade = user?.grade ?? 1;

  useEffect(() => {
    if (!token) return;

    setLoadingProfile(true);
    void getStudentProfile(token)
      .then((p) => setProfile(p))
      .catch(() => {
        // Backend not available — silently degrade
      })
      .finally(() => setLoadingProfile(false));
  }, [token]);

  useEffect(() => {
    void getDailyChallenge(grade).then((p) => setDailyChallenge(p));
  }, [grade]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function handleStartChallenge() {
    if (dailyChallenge) {
      router.push(`/learn/problem/${dailyChallenge.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-xl font-bold text-indigo-600">Koblio</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-8">
        {/* Welcome row */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-1 text-slate-500">Grade {grade}</p>
        </div>

        {/* Stats row */}
        {(profile || loadingProfile) && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {loadingProfile && !profile ? (
              <p className="text-sm text-slate-400">Loading stats…</p>
            ) : profile ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                  <CoinCounter coins={profile.coins} animated />
                  <StreakBadge streakCount={profile.streakCount} />
                  <Link
                    href="/dashboard/student/leaderboard"
                    className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View Leaderboard →
                  </Link>
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
        )}

        {/* Daily Challenge */}
        <DailyChallengeCard
          problem={dailyChallenge}
          grade={grade}
          onStart={handleStartChallenge}
        />

        {/* Start Learning CTA */}
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            🚀 Start Learning
          </Link>
        </div>
      </main>
    </div>
  );
}
