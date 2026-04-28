'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getProblems,
  createProblem,
  updateProblem,
  type Problem,
  type Difficulty,
  type ProblemType,
  type CreateProblemData,
} from '@/lib/api';

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
const PROBLEM_TYPES: ProblemType[] = ['MCQ', 'FILL_BLANK', 'TRUE_FALSE'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
};

interface EditorState {
  mode: 'create' | 'edit';
  problem?: Problem;
  grade: number;
  strand: string;
  topic: string;
  difficulty: Difficulty;
  type: ProblemType;
  contentJson: string;
}

function buildDefaultEditor(): EditorState {
  return {
    mode: 'create',
    grade: 1,
    strand: '',
    topic: '',
    difficulty: 'EASY',
    type: 'MCQ',
    contentJson: JSON.stringify(
      { question: '', answer: '', solution: '', options: [], hints: [] },
      null,
      2,
    ),
  };
}

function buildEditEditor(problem: Problem): EditorState {
  const content: Record<string, unknown> = {
    question: problem.questionText,
    answer: problem.correctAnswer,
    solution: problem.solution,
  };
  if (problem.options) content['options'] = problem.options.map((o) => o.text);
  if (problem.hints) content['hints'] = problem.hints;

  return {
    mode: 'edit',
    problem,
    grade: problem.grade,
    strand: problem.strand,
    topic: problem.topic,
    difficulty: problem.difficulty as Difficulty,
    type: problem.type as ProblemType,
    contentJson: JSON.stringify(content, null, 2),
  };
}

export default function AdminProblemsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect users who are not teacher or admin
    if (user && (user.role as string) !== 'teacher' && (user.role as string) !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (!token) return;
    if (user && (user.role as string) !== 'teacher' && (user.role as string) !== 'admin') return;

    setLoading(true);
    setFetchError(null);
    getProblems({ limit: 100 }, token)
      .then((res) => {
        setProblems(res.data);
        setTotal(res.total);
      })
      .catch(() => setFetchError('Could not load problems.'))
      .finally(() => setLoading(false));
  }, [token, user]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function openCreate() {
    setSaveError(null);
    setJsonError(null);
    setEditor(buildDefaultEditor());
  }

  function openEdit(problem: Problem) {
    setSaveError(null);
    setJsonError(null);
    setEditor(buildEditEditor(problem));
  }

  function closeEditor() {
    setEditor(null);
    setSaveError(null);
    setJsonError(null);
  }

  function validateJson(value: string): Record<string, unknown> | null {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async function handleSave() {
    if (!editor || !token) return;

    const parsedContent = validateJson(editor.contentJson);
    if (!parsedContent) {
      setJsonError('Invalid JSON. Fix syntax errors before saving.');
      return;
    }
    setJsonError(null);

    const payload: CreateProblemData = {
      grade: editor.grade,
      strand: editor.strand.trim(),
      topic: editor.topic.trim(),
      difficulty: editor.difficulty,
      type: editor.type,
      content: parsedContent,
    };

    setSaving(true);
    setSaveError(null);
    try {
      if (editor.mode === 'create') {
        const created = await createProblem(payload, token);
        setProblems((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
      } else {
        const updated = await updateProblem(editor.problem!.id, payload, token);
        setProblems((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      }
      closeEditor();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-xl font-bold text-indigo-600">Koblio Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Problem Library</h1>
            <p className="mt-1 text-slate-500">
              {total} problem{total !== 1 ? 's' : ''} in database
            </p>
          </div>
          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={openCreate}
          >
            + New Problem
          </Button>
        </div>

        <div className="flex gap-6">
          {/* ── Problem Table ──────────────────────────────────────────────── */}
          <div className={`flex-1 ${editor ? 'min-w-0' : ''}`}>
            {loading && !problems.length ? (
              <p className="text-sm text-slate-400">Loading problems…</p>
            ) : fetchError ? (
              <p className="text-sm text-red-500">{fetchError}</p>
            ) : problems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="text-slate-500">
                  No problems yet. Click &ldquo;+ New Problem&rdquo; to author one.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 text-left">Grade</th>
                      <th className="px-4 py-3 text-left">Strand</th>
                      <th className="px-4 py-3 text-left">Topic</th>
                      <th className="px-4 py-3 text-left">Difficulty</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {problems.map((p) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 ${editor?.problem?.id === p.id ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="px-4 py-3 text-slate-700">G{p.grade}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">
                          {p.strand}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">
                          {p.topic}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_COLORS[p.difficulty as Difficulty] ?? ''}`}
                          >
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{p.type}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Editor Panel ───────────────────────────────────────────────── */}
          {editor && (
            <div className="w-96 shrink-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm self-start">
              <h2 className="mb-5 text-lg font-semibold text-slate-800">
                {editor.mode === 'create' ? 'New Problem' : 'Edit Problem'}
              </h2>

              {saveError && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {saveError}
                </p>
              )}

              <div className="space-y-4">
                {/* Grade */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Grade (1–6)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editor.grade}
                    onChange={(e) =>
                      setEditor((prev) =>
                        prev ? { ...prev, grade: Number(e.target.value) } : prev,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Strand */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Strand
                  </label>
                  <input
                    type="text"
                    value={editor.strand}
                    onChange={(e) =>
                      setEditor((prev) =>
                        prev ? { ...prev, strand: e.target.value } : prev,
                      )
                    }
                    placeholder="e.g. operations-and-algebraic-thinking"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Topic */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={editor.topic}
                    onChange={(e) =>
                      setEditor((prev) =>
                        prev ? { ...prev, topic: e.target.value } : prev,
                      )
                    }
                    placeholder="e.g. addition"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Difficulty
                  </label>
                  <select
                    value={editor.difficulty}
                    onChange={(e) =>
                      setEditor((prev) =>
                        prev
                          ? { ...prev, difficulty: e.target.value as Difficulty }
                          : prev,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Type
                  </label>
                  <select
                    value={editor.type}
                    onChange={(e) =>
                      setEditor((prev) =>
                        prev
                          ? { ...prev, type: e.target.value as ProblemType }
                          : prev,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {PROBLEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content JSON */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Content JSON
                  </label>
                  <p className="mb-1.5 text-xs text-slate-400">
                    Must include: <code className="font-mono">question</code>,{' '}
                    <code className="font-mono">answer</code>,{' '}
                    <code className="font-mono">solution</code>
                  </p>
                  <textarea
                    rows={12}
                    value={editor.contentJson}
                    onChange={(e) => {
                      setJsonError(null);
                      setEditor((prev) =>
                        prev ? { ...prev, contentJson: e.target.value } : prev,
                      );
                    }}
                    spellCheck={false}
                    className={`w-full rounded-lg border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 ${
                      jsonError
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }`}
                  />
                  {jsonError && (
                    <p className="mt-1 text-xs text-red-600">{jsonError}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => void handleSave()}
                  disabled={saving || !editor.strand.trim() || !editor.topic.trim()}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="outline" onClick={closeEditor} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
