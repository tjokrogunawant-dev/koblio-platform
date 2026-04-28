'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getMyClassrooms,
  getProblems,
  createAssignment,
  type ClassroomSummary,
  type Problem,
} from '@/lib/api';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const STRANDS = [
  { value: 'number_and_operations', label: 'Number & Operations' },
  { value: 'geometry', label: 'Geometry' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'data_and_statistics', label: 'Data & Statistics' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'EASY', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'HARD', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-300' },
];

export default function NewAssignmentPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);

  // Form state
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [title, setTitle] = useState('');
  const [strand, setStrand] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  // Problem picker state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<Set<string>>(new Set());

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  // Load classrooms
  useEffect(() => {
    if (!token) return;
    setLoadingClassrooms(true);
    getMyClassrooms(token)
      .then((data) => {
        setClassrooms(data);
        if (data.length > 0 && !selectedClassroomId) {
          setSelectedClassroomId(data[0].id);
        }
      })
      .catch(() => {
        // silently degrade
      })
      .finally(() => setLoadingClassrooms(false));
  }, [token, selectedClassroomId]);

  // Fetch problems when grade/strand/topic/difficulty are ready
  function handleFetchProblems() {
    if (!selectedClassroom || !strand) return;
    setLoadingProblems(true);
    setProblemsError(null);
    setSelectedProblemIds(new Set());
    getProblems(
      {
        grade: selectedClassroom.grade,
        strand,
        topic: topic || undefined,
        difficulty,
        limit: 20,
      },
      token ?? undefined,
    )
      .then((res) => setProblems(res.data))
      .catch(() => setProblemsError('Could not load problems. Please try again.'))
      .finally(() => setLoadingProblems(false));
  }

  function toggleProblem(id: string) {
    setSelectedProblemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 10) {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedClassroom || !title.trim() || !strand || selectedProblemIds.size === 0) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createAssignment(
        {
          classroomId: selectedClassroom.id,
          title: title.trim(),
          topic: topic.trim() || strand,
          strand,
          grade: selectedClassroom.grade,
          difficulty,
          problemIds: Array.from(selectedProblemIds),
          dueDate: dueDate || undefined,
        },
        token,
      );
      router.push('/dashboard/teacher');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create assignment.');
      setSubmitting(false);
    }
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

      <main className="mx-auto max-w-3xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">New Assignment</h1>
          <p className="mt-1 text-slate-500">Set up an assignment for your class.</p>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</div>
          )}

          {/* Classroom */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Classroom <span className="text-red-500">*</span>
            </label>
            {loadingClassrooms ? (
              <p className="text-sm text-slate-400">Loading classrooms…</p>
            ) : (
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select a classroom…</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Grade {c.grade})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Grade (read-only from classroom) */}
          {selectedClassroom && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Grade</label>
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
                Grade {selectedClassroom.grade}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Addition Practice Week 3"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Strand */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Strand <span className="text-red-500">*</span>
            </label>
            <select
              value={strand}
              onChange={(e) => setStrand(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Select a strand…</option>
              {STRANDS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. two-digit addition (optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-lg border-2 px-5 py-2 text-sm font-semibold transition-all ${
                    difficulty === d.value
                      ? d.color + ' border-current'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Due Date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Problem Picker */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Problems <span className="text-red-500">*</span>{' '}
                <span className="font-normal text-slate-400">(select up to 10)</span>
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleFetchProblems}
                disabled={!selectedClassroom || !strand || loadingProblems}
              >
                {loadingProblems ? 'Loading…' : 'Browse Problems'}
              </Button>
            </div>

            {selectedProblemIds.size > 0 && (
              <p className="mb-2 text-xs text-indigo-600">
                {selectedProblemIds.size} problem{selectedProblemIds.size !== 1 ? 's' : ''} selected
              </p>
            )}

            {problemsError && <p className="mb-2 text-sm text-red-500">{problemsError}</p>}

            {!strand && (
              <p className="text-sm text-slate-400">
                Choose a strand above, then click &ldquo;Browse Problems&rdquo;.
              </p>
            )}

            {problems.length > 0 && (
              <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200">
                {problems.map((p) => {
                  const selected = selectedProblemIds.has(p.id);
                  const disabled = !selected && selectedProblemIds.size >= 10;
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 ${
                        selected ? 'bg-indigo-50' : ''
                      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => toggleProblem(p.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{p.questionText}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {p.type} &middot; {p.difficulty}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={
                submitting ||
                !selectedClassroomId ||
                !title.trim() ||
                !strand ||
                selectedProblemIds.size === 0
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? 'Creating…' : 'Create Assignment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/teacher')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
