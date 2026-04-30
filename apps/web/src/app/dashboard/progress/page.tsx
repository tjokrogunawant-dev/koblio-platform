'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getMyClassrooms, getClassroomProgress, type ClassroomSummary, type StudentProgressRow } from '@/lib/api';

function AccuracyBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color = clamped >= 80 ? 'bg-green-500' : clamped >= 50 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-slate-600">{Math.round(clamped)}%</span>
    </div>
  );
}

export default function ProgressPage() {
  const { token } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [progress, setProgress] = useState<StudentProgressRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyClassrooms(token)
      .then((data) => {
        setClassrooms(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !selectedId) return;
    setLoading(true);
    setError(null);
    getClassroomProgress(selectedId, token)
      .then((data) => setProgress(data.students))
      .catch(() => setError('Could not load progress data.'))
      .finally(() => setLoading(false));
  }, [token, selectedId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">View student progress and mastery data.</p>
      </div>

      {classrooms.length > 1 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Classroom</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.name} (Grade {c.grade})</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading progress…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : progress.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-slate-500">No progress data yet. Students need to solve problems first.</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {progress.map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{row.name}</td>
                  <td className="px-5 py-3 text-slate-600">{row.totalAttempts}</td>
                  <td className="px-5 py-3 text-slate-600">{row.correctAttempts}</td>
                  <td className="px-5 py-3"><AccuracyBar percent={row.accuracyPercent} /></td>
                  <td className="px-5 py-3 text-slate-600">
                    {row.streakCount > 0
                      ? <span className="inline-flex items-center gap-1">🔥 {row.streakCount}</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
