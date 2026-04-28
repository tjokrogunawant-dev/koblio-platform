'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar } from '@/components/avatar';
import { BadgeShelf } from '@/components/badge-shelf';
import { CoinCounter } from '@/components/gamification/coin-counter';
import { XPBar } from '@/components/gamification/xp-bar';
import { StreakBadge } from '@/components/gamification/streak-badge';
import { DailyChallengeCard } from '@/components/gamification/daily-challenge-card';
import {
  getStudentProfile,
  getDailyChallenge,
  getStudentAssignments,
  getMyBadges,
  type StudentGamificationProfile,
  type Problem,
  type StudentAssignment,
  type BadgeDto,
} from '@/lib/api';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [profile, setProfile] = useState<StudentGamificationProfile | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<Problem | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [badges, setBadges] = useState<BadgeDto[]>([]);

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

    setLoadingAssignments(true);
    void getStudentAssignments(token)
      .then((a) => setAssignments(a))
      .catch(() => {
        // silently degrade — assignments section will be empty
      })
      .finally(() => setLoadingAssignments(false));

    void getMyBadges(token)
      .then((b) => setBadges(b))
      .catch(() => {
        // silently degrade — badge shelf will show empty state
      });
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
        <div className="flex items-center gap-4">
          <Avatar slug={user?.avatarSlug} size="lg" name={displayName} />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome back, {displayName}!</h1>
            <p className="mt-1 text-slate-500">Grade {grade}</p>
            {!user?.avatarSlug && (
              <Link
                href="/profile/setup"
                className="mt-1 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Pick your avatar →
              </Link>
            )}
          </div>
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
        <DailyChallengeCard problem={dailyChallenge} grade={grade} onStart={handleStartChallenge} />

        {/* Start Learning CTA */}
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            🚀 Start Learning
          </Link>
        </div>

        {/* Badge shelf */}
        <BadgeShelf badges={badges} />

        {/* Assignments section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-800">Assignments</h2>
          {loadingAssignments && assignments.length === 0 ? (
            <p className="text-sm text-slate-400">Loading assignments…</p>
          ) : assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
              <p className="text-slate-500">No assignments yet. Check back later!</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Class</th>
                    <th className="px-5 py-3 text-left">Topic</th>
                    <th className="px-5 py-3 text-left">Due</th>
                    <th className="px-5 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((a) => (
                    <tr key={a.assignmentId} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{a.title}</td>
                      <td className="px-5 py-3 text-slate-600">{a.classroomName}</td>
                      <td className="px-5 py-3 text-slate-600">{a.topic}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {a.dueDate
                          ? new Date(a.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/student/assignments/${a.assignmentId}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Start →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
