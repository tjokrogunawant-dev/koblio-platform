'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { getChildProgress, getMyChildren, type ChildProgress, type ChildRef } from '@/lib/api';

function AccuracyBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color =
    clamped >= 80
      ? 'bg-green-500'
      : clamped >= 50
        ? 'bg-yellow-400'
        : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-sm text-slate-600">{Math.round(clamped)}%</span>
    </div>
  );
}

function XPBar({ xp, level }: { xp: number; level: number }) {
  // Simple linear scale: 100 XP per level for display purposes
  const xpPerLevel = 100;
  const xpInLevel = xp % xpPerLevel;
  const progressPct = (xpInLevel / xpPerLevel) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>Level {level}</span>
        <span>{xpInLevel}/{xpPerLevel} XP</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-indigo-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function ChildProgressCard({ child, token }: { child: ChildRef; token: string }) {
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getChildProgress(child.id, token)
      .then((data) => setProgress(data))
      .catch(() => setError('Could not load progress.'))
      .finally(() => setLoading(false));
  }, [child.id, token]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{child.name}</h3>
          {child.grade !== undefined && (
            <p className="text-sm text-slate-500">Grade {child.grade}</p>
          )}
        </div>
        {progress && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              🔥 {progress.streakCount}
            </span>
            <span className="text-sm text-slate-500">
              🪙 {progress.coins.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-slate-400">Loading progress…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {progress && (
        <>
          <XPBar xp={progress.xp} level={progress.level} />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Problems Attempted</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {progress.totalAttempts}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Correct</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {progress.correctAttempts}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-1 col-span-2">
              <p className="text-xs text-slate-500">Accuracy</p>
              <div className="mt-2">
                <AccuracyBar percent={progress.accuracyPercent} />
              </div>
            </div>
          </div>

          {progress.topicBreakdown.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700">
                Topic Breakdown
              </h4>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 text-left">Topic</th>
                      <th className="px-3 py-2 text-right">Attempted</th>
                      <th className="px-3 py-2 text-right">Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {progress.topicBreakdown.map((t) => (
                      <tr key={t.topic} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-700">{t.topic}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{t.attempted}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{t.correct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [children, setChildren] = useState<ChildRef[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoadingChildren(true);
    getMyChildren(token)
      .then(setChildren)
      .catch(() => setChildren([]))
      .finally(() => setLoadingChildren(false));
  }, [token]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-xl font-bold text-indigo-600">Koblio</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Parent Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Welcome, {user?.name ?? 'Parent'}
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            My Children
          </h2>

          {loadingChildren ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : children.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
              <p className="text-base font-medium text-slate-600">
                No children linked yet
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Ask your child&apos;s teacher for the class code, then link your
                child at{' '}
                <span className="font-medium text-indigo-600">Settings</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {token &&
                children.map((child) => (
                  <ChildProgressCard key={child.id} child={child} token={token} />
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
