'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { getMyAssignments, type AssignmentSummary } from '@/lib/api';

function difficultyColor(d: string) {
  if (d === 'EASY') return 'bg-green-100 text-green-700';
  if (d === 'HARD') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssignmentsPage() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMyAssignments(token)
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments for your classes.</p>
        </div>
        <Link
          href="/dashboard/teacher/assignments/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New Assignment
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-slate-500">
            No assignments yet.{' '}
            <Link href="/dashboard/teacher/assignments/new" className="font-medium text-indigo-600 hover:underline">
              Create one
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Class</th>
                <th className="px-5 py-3 text-left">Topic</th>
                <th className="px-5 py-3 text-left">Difficulty</th>
                <th className="px-5 py-3 text-left">Due Date</th>
                <th className="px-5 py-3 text-left">Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{a.title}</td>
                  <td className="px-5 py-3 text-slate-600">{a.classroomName}</td>
                  <td className="px-5 py-3 text-slate-600">{a.topic}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${difficultyColor(a.difficulty)}`}>
                      {a.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(a.dueDate)}</td>
                  <td className="px-5 py-3 text-slate-600">{a.submissionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
