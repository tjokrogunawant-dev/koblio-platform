'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getMyClassrooms,
  getMyAssignments,
  createClassroom,
  type ClassroomSummary,
  type AssignmentSummary,
} from '@/lib/api';

function difficultyColor(difficulty: string) {
  if (difficulty === 'EASY') return 'bg-green-100 text-green-700';
  if (difficulty === 'HARD') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [classroomsError, setClassroomsError] = useState<string | null>(null);

  // New class form state
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(1);
  const [creatingClass, setCreatingClass] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setLoadingClassrooms(true);
    getMyClassrooms(token)
      .then((data) => setClassrooms(data))
      .catch(() => setClassroomsError('Could not load classrooms.'))
      .finally(() => setLoadingClassrooms(false));

    setLoadingAssignments(true);
    getMyAssignments(token)
      .then((data) => setAssignments(data))
      .catch(() => {
        // silently degrade — assignments section will just be empty
      })
      .finally(() => setLoadingAssignments(false));
  }, [token]);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newClassName.trim()) return;
    setCreatingClass(true);
    setCreateError(null);
    try {
      const created = await createClassroom(
        { name: newClassName.trim(), grade: newClassGrade },
        token,
      );
      setClassrooms((prev) => [
        ...prev,
        { ...created, studentCount: 0 },
      ]);
      setNewClassName('');
      setNewClassGrade(1);
      setShowNewClass(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create class.');
    } finally {
      setCreatingClass(false);
    }
  }

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

      <main className="mx-auto max-w-5xl space-y-8 p-8">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Teacher Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Welcome back, {user?.name ?? 'Teacher'}
          </p>
        </div>

        {/* ── My Classes ─────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">My Classes</h2>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setShowNewClass((v) => !v)}
            >
              {showNewClass ? 'Cancel' : '+ New Class'}
            </Button>
          </div>

          {/* Inline new-class form */}
          {showNewClass && (
            <form
              onSubmit={(e) => { void handleCreateClass(e); }}
              className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-indigo-800">Create a New Class</h3>
              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                    placeholder="e.g. Room 3B"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Grade
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={creatingClass || !newClassName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {creatingClass ? 'Creating…' : 'Create Class'}
              </Button>
            </form>
          )}

          {loadingClassrooms && !classrooms.length ? (
            <p className="text-sm text-slate-400">Loading classes…</p>
          ) : classroomsError ? (
            <p className="text-sm text-red-500">{classroomsError}</p>
          ) : classrooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-slate-500">No classes yet. Create your first class above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Grade {cls.grade}
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                      {cls.classCode}
                    </span>
                    <span className="text-xs text-slate-500">
                      {cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/teacher/classes/${cls.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View Students →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Assignments ─────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Recent Assignments
            </h2>
            <Link
              href="/dashboard/teacher/assignments/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + New Assignment
            </Link>
          </div>

          {loadingAssignments && !assignments.length ? (
            <p className="text-sm text-slate-400">Loading assignments…</p>
          ) : assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-slate-500">
                No assignments yet.{' '}
                <Link
                  href="/dashboard/teacher/assignments/new"
                  className="font-medium text-indigo-600 hover:underline"
                >
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
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${difficultyColor(a.difficulty)}`}
                        >
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
        </section>
      </main>
    </div>
  );
}
