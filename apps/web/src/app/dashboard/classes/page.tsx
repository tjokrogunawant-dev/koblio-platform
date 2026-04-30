'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { getMyClassrooms, createClassroom, type ClassroomSummary } from '@/lib/api';

export default function ClassesPage() {
  const { token } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMyClassrooms(token)
      .then(setClassrooms)
      .catch(() => setError('Could not load classrooms.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createClassroom({ name: name.trim(), grade }, token);
      setClassrooms((prev) => [...prev, { ...created, studentCount: 0 }]);
      setName('');
      setGrade(1);
      setShowForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create class.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage your classes and students.</p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ New Class'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { void handleCreate(e); }}
          className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-indigo-800">Create a New Class</h3>
          {createError && <p className="text-sm text-red-600">{createError}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Class Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Room 3B"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={creating || !name.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {creating ? 'Creating…' : 'Create Class'}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading classes…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
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
    </div>
  );
}
