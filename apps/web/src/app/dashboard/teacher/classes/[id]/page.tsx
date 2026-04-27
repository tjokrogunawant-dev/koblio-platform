'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getClassroomStudents,
  getClassroomProgress,
  getMyClassrooms,
  type StudentSummary,
  type ClassroomSummary,
  type StudentProgressRow,
} from '@/lib/api';

type Tab = 'students' | 'progress';

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
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-slate-600">{Math.round(clamped)}%</span>
    </div>
  );
}

function TopicBreakdownTooltip({
  breakdown,
}: {
  breakdown: StudentProgressRow['topicBreakdown'];
}) {
  const [open, setOpen] = useState(false);

  if (!breakdown.length) return <span className="text-xs text-slate-400">—</span>;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-indigo-600 hover:underline"
      >
        {breakdown.length} topic{breakdown.length !== 1 ? 's' : ''} ▾
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="space-y-1.5">
            {breakdown.map((t) => (
              <div key={t.topic} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate">{t.topic}</span>
                <span className="ml-2 shrink-0 text-slate-500">
                  {t.correct}/{t.attempted}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassDetailPage() {
  const params = useParams();
  const { token } = useAuth();

  const classroomId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [tab, setTab] = useState<Tab>('students');
  const [classroom, setClassroom] = useState<ClassroomSummary | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [progress, setProgress] = useState<StudentProgressRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load classroom meta from getMyClassrooms (to get name/grade/classCode)
  useEffect(() => {
    if (!token) return;
    getMyClassrooms(token)
      .then((list) => {
        const found = list.find((c) => c.id === classroomId);
        if (found) setClassroom(found);
      })
      .catch(() => {
        // not critical — header just won't show details
      });
  }, [token, classroomId]);

  // Load students
  useEffect(() => {
    if (!token || !classroomId) return;
    setLoadingStudents(true);
    getClassroomStudents(classroomId, token)
      .then((data) => setStudents(data))
      .catch(() => setStudentsError('Could not load students.'))
      .finally(() => setLoadingStudents(false));
  }, [token, classroomId]);

  // Load progress when tab switches to progress
  useEffect(() => {
    if (tab !== 'progress' || !token || !classroomId) return;
    if (progress.length > 0) return; // already loaded
    setLoadingProgress(true);
    getClassroomProgress(classroomId, token)
      .then((data) => setProgress(data.students))
      .catch(() => setProgressError('Could not load progress data.'))
      .finally(() => setLoadingProgress(false));
  }, [tab, token, classroomId, progress.length]);

  function handleCopyCode() {
    if (!classroom?.classCode) return;
    void navigator.clipboard.writeText(classroom.classCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <Link
          href="/dashboard/teacher"
          className="text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          ← Teacher Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-8">
        {/* Class header */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">
              {classroom?.name ?? 'Loading…'}
            </h1>
            {classroom && (
              <p className="mt-1 text-slate-500">
                Grade {classroom.grade} &middot; {classroom.studentCount} student
                {classroom.studentCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {classroom?.classCode && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Class Code</span>
              <span className="font-mono text-lg font-bold tracking-widest text-indigo-700">
                {classroom.classCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
          {(['students', 'progress'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'students' ? 'Students' : 'Progress'}
            </button>
          ))}
        </div>

        {/* Students tab */}
        {tab === 'students' && (
          <div>
            {loadingStudents ? (
              <p className="text-sm text-slate-400">Loading students…</p>
            ) : studentsError ? (
              <p className="text-sm text-red-500">{studentsError}</p>
            ) : students.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-slate-500">
                  No students enrolled yet. Share the class code{' '}
                  {classroom?.classCode && (
                    <span className="font-mono font-bold text-indigo-700">
                      {classroom.classCode}
                    </span>
                  )}{' '}
                  with your students.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 text-left">Student</th>
                      <th className="px-5 py-3 text-left">Streak</th>
                      <th className="px-5 py-3 text-left">Coins</th>
                      <th className="px-5 py-3 text-left">XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.studentId} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {s.name}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {s.streakCount > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span>🔥</span>
                              <span>{s.streakCount}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <span>🪙</span>
                            <span>{s.coins.toLocaleString()}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {s.xp.toLocaleString()} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Progress tab */}
        {tab === 'progress' && (
          <div>
            {loadingProgress ? (
              <p className="text-sm text-slate-400">Loading progress…</p>
            ) : progressError ? (
              <p className="text-sm text-red-500">{progressError}</p>
            ) : progress.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-slate-500">No progress data available yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 text-left">Student</th>
                      <th className="px-5 py-3 text-left">Attempts</th>
                      <th className="px-5 py-3 text-left">Correct</th>
                      <th className="px-5 py-3 text-left">Accuracy</th>
                      <th className="px-5 py-3 text-left">Streak</th>
                      <th className="px-5 py-3 text-left">Topics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {progress.map((row) => (
                      <tr key={row.studentId} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {row.name}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{row.totalAttempts}</td>
                        <td className="px-5 py-3 text-slate-600">{row.correctAttempts}</td>
                        <td className="px-5 py-3">
                          <AccuracyBar percent={row.accuracyPercent} />
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {row.streakCount > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span>🔥</span>
                              <span>{row.streakCount}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <TopicBreakdownTooltip breakdown={row.topicBreakdown} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
