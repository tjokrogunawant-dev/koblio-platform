'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getStudentAssignments,
  getProblem,
  submitAssignment,
  type StudentAssignment,
  type Problem,
  type AssignmentResult,
} from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = 'LOADING' | 'SOLVING' | 'SUBMITTING' | 'RESULTS' | 'ERROR';

interface AnswerEntry {
  problemId: string;
  answer: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Problem {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function difficultyClass(difficulty: string) {
  if (difficulty === 'EASY') return 'bg-green-100 text-green-700';
  if (difficulty === 'HARD') return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentAssignmentSolvePage() {
  const params = useParams();
  const _router = useRouter();
  const { token } = useAuth();

  const assignmentId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : '';

  const [pageState, setPageState] = useState<PageState>('LOADING');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Assignment data
  const [assignment, setAssignment] = useState<StudentAssignment | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);

  // Current problem index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-problem answer state
  const [fillValue, setFillValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const fillInputRef = useRef<HTMLInputElement>(null);

  // Results
  const [results, setResults] = useState<AssignmentResult | null>(null);

  const currentProblem = problems[currentIndex] ?? null;

  // Load assignment and then all its problems
  useEffect(() => {
    if (!token || !assignmentId) return;

    getStudentAssignments(token)
      .then((list) => {
        const found = list.find((a) => a.assignmentId === assignmentId);
        if (!found) {
          setErrorMsg('Assignment not found.');
          setPageState('ERROR');
          return;
        }
        setAssignment(found);

        // Load all problems in parallel
        return Promise.all(found.problemIds.map((pid) => getProblem(pid, token)));
      })
      .then((loaded) => {
        if (!loaded) return;
        setProblems(loaded);
        setPageState('SOLVING');
      })
      .catch(() => {
        setErrorMsg('Could not load this assignment. Please try again.');
        setPageState('ERROR');
      });
  }, [token, assignmentId]);

  // Auto-focus fill input
  useEffect(() => {
    if (pageState === 'SOLVING' && currentProblem?.type === 'FILL_BLANK') {
      fillInputRef.current?.focus();
    }
    // Reset per-problem inputs on index change
    setFillValue('');
    setSelectedOption(null);
  }, [currentIndex, pageState, currentProblem?.type]);

  function recordAnswer(problemId: string, answer: string) {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.problemId === problemId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { problemId, answer };
        return next;
      }
      return [...prev, { problemId, answer }];
    });
  }

  function advanceOrSubmit(problemId: string, answer: string) {
    recordAnswer(problemId, answer);

    if (currentIndex < problems.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // All problems answered — submit
      const allAnswers = [
        ...answers.filter((a) => a.problemId !== problemId),
        { problemId, answer },
      ];
      void handleSubmit(allAnswers);
    }
  }

  async function handleSubmit(allAnswers: AnswerEntry[]) {
    if (!token || !assignmentId) return;
    setPageState('SUBMITTING');
    try {
      const result = await submitAssignment(assignmentId, { answers: allAnswers }, token);
      setResults(result);
      setPageState('RESULTS');
    } catch {
      // Compute local result if API fails
      const localResults = problems.map((p) => {
        const entry = allAnswers.find((a) => a.problemId === p.id);
        const isCorrect =
          !!entry &&
          entry.answer.trim().toLowerCase() === p.correctAnswer.trim().toLowerCase();
        return { problemId: p.id, correct: isCorrect, correctAnswer: p.correctAnswer };
      });
      const correct = localResults.filter((r) => r.correct).length;
      setResults({ correct, total: problems.length, results: localResults });
      setPageState('RESULTS');
    }
  }

  function handleMCQ(answer: string) {
    setSelectedOption(answer);
    if (currentProblem) advanceOrSubmit(currentProblem.id, answer);
  }

  function handleFillSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = fillValue.trim();
    if (!trimmed || !currentProblem) return;
    advanceOrSubmit(currentProblem.id, trimmed);
  }

  function handleTrueFalse(val: 'True' | 'False') {
    if (currentProblem) advanceOrSubmit(currentProblem.id, val);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (pageState === 'LOADING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="text-slate-500">Loading assignment…</span>
      </div>
    );
  }

  if (pageState === 'ERROR') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8">
        <p className="text-red-600">{errorMsg}</p>
        <Link
          href="/dashboard/student"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (pageState === 'SUBMITTING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="text-slate-500">Submitting assignment…</span>
      </div>
    );
  }

  // ── RESULTS ─────────────────────────────────────────────────────────────────

  if (pageState === 'RESULTS' && results) {
    const pct =
      results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <Link
            href="/dashboard/student"
            className="text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            ← Dashboard
          </Link>
        </header>

        <main className="mx-auto max-w-2xl space-y-6 p-8">
          <div className="text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl ${
                pct >= 80
                  ? 'bg-green-100'
                  : pct >= 50
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
              }`}
            >
              {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              {results.correct}/{results.total} Correct
            </h1>
            <p className="mt-1 text-slate-500">{pct}% accuracy</p>
          </div>

          {/* Per-problem results */}
          {results.results.some((r) => !r.correct) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Review Incorrect Answers
              </h2>
              <div className="space-y-3">
                {results.results
                  .filter((r) => !r.correct)
                  .map((r) => {
                    const p = problems.find((prob) => prob.id === r.problemId);
                    const yourAnswer = answers.find((a) => a.problemId === r.problemId)?.answer;
                    return (
                      <div
                        key={r.problemId}
                        className="rounded-lg bg-red-50 p-4 text-sm"
                      >
                        {p && (
                          <p className="mb-1 font-medium text-slate-800">
                            {p.questionText}
                          </p>
                        )}
                        {yourAnswer && (
                          <p className="text-red-600">
                            Your answer: <span className="font-medium">{yourAnswer}</span>
                          </p>
                        )}
                        <p className="text-green-700">
                          Correct: <span className="font-medium">{r.correctAnswer}</span>
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/dashboard/student"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/learn"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Continue Learning
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── SOLVING ─────────────────────────────────────────────────────────────────

  if (!currentProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="text-slate-500">Loading problem…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link
          href="/dashboard/student"
          className="text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          ← Dashboard
        </Link>
        <span className="text-sm font-medium text-slate-700">
          {assignment?.title}
        </span>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-8">
        <ProgressBar current={currentIndex + 1} total={problems.length} />

        {/* Problem meta */}
        <p className="text-sm text-slate-500">
          Grade {currentProblem.grade} &middot; {currentProblem.strand} &middot;{' '}
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-semibold ${difficultyClass(currentProblem.difficulty)}`}
          >
            {currentProblem.difficulty}
          </span>
        </p>

        {/* Question card */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <p className="text-lg font-medium leading-relaxed text-slate-800">
            {currentProblem.questionText}
          </p>
        </div>

        {/* Answer inputs */}
        <div>
          {currentProblem.type === 'MCQ' && (
            <div className="space-y-3">
              {(currentProblem.options ?? []).map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleMCQ(opt.label)}
                  className={`w-full rounded-lg border-2 px-5 py-3.5 text-left transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    selectedOption === opt.label
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="mr-3 font-bold text-indigo-600">
                    {opt.label}.
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {currentProblem.type === 'FILL_BLANK' && (
            <form onSubmit={handleFillSubmit} className="flex gap-3">
              <input
                ref={fillInputRef}
                type="text"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                placeholder="Your answer…"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="submit"
                disabled={!fillValue.trim()}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                {currentIndex < problems.length - 1 ? 'Next →' : 'Submit'}
              </button>
            </form>
          )}

          {currentProblem.type === 'TRUE_FALSE' && (
            <div className="flex gap-4">
              {(['True', 'False'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => handleTrueFalse(val)}
                  className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-5 text-lg font-bold text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {val}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
