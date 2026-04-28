'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { LeaderboardWidget } from '@/components/gamification/leaderboard-widget';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/api';

interface LeaderboardState {
  rank: number;
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardPage() {
  const { user, token } = useAuth();

  const [state, setState] = useState<LeaderboardState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // classroomId is expected on the AuthUser when the student is enrolled in a class.
  // If it's absent (e.g. no class joined yet), we show a helpful message.
  const classroomId = (user as (typeof user & { classroomId?: string }) | null)?.classroomId;

  useEffect(() => {
    if (!token || !classroomId) return;

    setLoading(true);
    setError(null);

    void getLeaderboard(classroomId, token)
      .then((data) => {
        setState({ rank: data.rank, leaderboard: data.leaderboard });
      })
      .catch(() => {
        setError('Could not load the leaderboard. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [token, classroomId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link
          href="/dashboard/student"
          className="text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          ← Back to Dashboard
        </Link>
        <span className="text-lg font-bold text-indigo-600">Leaderboard</span>
      </header>

      <main className="mx-auto max-w-2xl p-8">
        {!classroomId ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-2xl">🏫</p>
            <p className="mt-2 font-semibold text-slate-700">Join a class to see the leaderboard</p>
            <p className="mt-1 text-sm text-slate-500">
              Ask your teacher for a class code to get started.
            </p>
          </div>
        ) : loading ? (
          <p className="text-center text-slate-500">Loading leaderboard…</p>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">{error}</div>
        ) : state ? (
          <LeaderboardWidget
            leaderboard={state.leaderboard}
            currentStudentId={user?.id ?? ''}
            myRank={state.rank}
          />
        ) : null}
      </main>
    </div>
  );
}
