'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MathRenderer } from '@koblio/ui';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getProblem,
  submitAnswer,
  type Problem,
  type Difficulty,
} from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = 'LOADING' | 'QUESTION' | 'ANSWERED';

interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  solution: string;
  yourAnswer: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyBadge(difficulty: Difficulty) {
  const map: Record<Difficulty, string> = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD: 'bg-red-100 text-red-700',
  };
  return map[difficulty] ?? 'bg-slate-100 text-slate-700';
}

/**
 * Render text that may contain inline LaTeX delimited by $…$
 * e.g. "What is $\frac{1}{2} + \frac{1}{4}$?"
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const expr = part.slice(1, -1);
          return <MathRenderer key={i} expression={expr} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function formatTime(ms: number) {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [pageState, setPageState] = useState<PageState>('LOADING');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Answer input state
  const [fillValue, setFillValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hint state
  const [hintIndex, setHintIndex] = useState<number>(-1); // -1 = no hint shown
  const [hintUsed, setHintUsed] = useState(false);

  // Timer
  const startTimeRef = useRef<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Answer result
  const [result, setResult] = useState<AnswerResult | null>(null);

  const fillInputRef = useRef<HTMLInputElement>(null);

  // Load problem
  useEffect(() => {
    if (!id) return;
    setPageState('LOADING');
    setLoadError(null);
    getProblem(id, token ?? undefined)
      .then((p) => {
        setProblem(p);
        setPageState('QUESTION');
      })
      .catch(() => {
        setLoadError('Could not load this problem. Please go back and try again.');
        setPageState('LOADING');
      });
  }, [id, token]);

  // Start timer when entering QUESTION state
  useEffect(() => {
    if (pageState === 'QUESTION') {
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pageState]);

  // Auto-focus fill input
  useEffect(() => {
    if (pageState === 'QUESTION' && problem?.type === 'FILL_BLANK') {
      fillInputRef.current?.focus();
    }
  }, [pageState, problem?.type]);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return Date.now() - startTimeRef.current;
  }

  async function handleSubmit(answer: string) {
    if (!problem) return;
    setSubmitting(true);
    setSubmitError(null);

    const timeSpentMs = stopTimer();
    setElapsedMs(timeSpentMs);

    // Optimistic local comparison — used if API is unavailable
    const localCorrect =
      answer.trim().toLowerCase() === problem.correctAnswer.trim().toLowerCase();

    try {
      const res = await submitAnswer(
        { problemId: problem.id, answer, timeSpentMs, hintUsed },
        token ?? '',
      );
      setResult({
        correct: res.correct,
        correctAnswer: res.correctAnswer,
        solution: res.solution,
        yourAnswer: answer,
      });
    } catch {
      // Backend not available — fall back to local comparison
      setSubmitError('Could not record your answer (server unavailable).');
      setResult({
        correct: localCorrect,
        correctAnswer: problem.correctAnswer,
        solution: problem.solution,
        yourAnswer: answer,
      });
    } finally {
      setSubmitting(false);
      setPageState('ANSWERED');
    }
  }

  function handleMCQSelect(optionLabel: string) {
    setSelectedOption(optionLabel);
    void handleSubmit(optionLabel);
  }

  function handleFillSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = fillValue.trim();
    if (!trimmed) return;
    void handleSubmit(trimmed);
  }

  function handleTrueFalse(value: 'True' | 'False') {
    void handleSubmit(value);
  }

  function handleShowHint() {
    const hints = problem?.hints ?? [];
    const next = hintIndex + 1;
    if (next < hints.length) {
      setHintIndex(next);
      setHintUsed(true);
    }
  }

  function handleTryAgain() {
    setPageState('QUESTION');
    setFillValue('');
    setSelectedOption(null);
    setResult(null);
    setHintIndex(-1);
    setHintUsed(false);
    setSubmitError(null);
  }

  const hints = problem?.hints ?? [];
  const hasMoreHints = hintIndex < hints.length - 1;
  const hintButtonLabel =
    hintIndex === -1
      ? 'Hint'
      : hasMoreHints
        ? `Hint ${hintIndex + 2}`
        : 'No more hints';

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8">
        <p className="text-red-600">{loadError}</p>
        <Link
          href="/learn"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Topics
        </Link>
      </div>
    );
  }

  if (pageState === 'LOADING' || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="text-slate-500">Loading problem…</span>
      </div>
    );
  }

  // ── QUESTION state ──────────────────────────────────────────────────────────

  if (pageState === 'QUESTION') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <Link
            href="/learn"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            ← Back to topics
          </Link>
          <button
            onClick={handleShowHint}
            disabled={!hasMoreHints && hintIndex >= 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40"
          >
            {hintButtonLabel}
          </button>
        </header>

        <main className="mx-auto max-w-2xl p-8">
          {/* Meta line */}
          <p className="mb-4 text-sm text-slate-500">
            Grade {problem.grade}
            {' • '}
            {problem.strand}
            {' • '}
            <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${difficultyBadge(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </p>

          {/* Question card */}
          <div className="relative rounded-xl bg-white p-6 shadow-md">
            {/* Timer */}
            <span className="absolute right-4 top-3 text-xs text-slate-400">
              {formatTime(elapsedMs)}
            </span>

            <p className="text-lg font-medium leading-relaxed text-slate-800">
              <RichText text={problem.questionText} />
            </p>

            {/* Hints */}
            {hintIndex >= 0 && (
              <div className="mt-4 space-y-2">
                {hints.slice(0, hintIndex + 1).map((h, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800"
                  >
                    <span className="font-semibold">Hint {i + 1}:</span>{' '}
                    <RichText text={h} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answer input */}
          <div className="mt-6">
            {problem.type === 'MCQ' && (
              <div className="space-y-3" aria-label="mcq-options">
                {(problem.options ?? []).map((opt) => (
                  <button
                    key={opt.label}
                    disabled={submitting}
                    onClick={() => handleMCQSelect(opt.label)}
                    className={`w-full rounded-lg border-2 px-5 py-3.5 text-left transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
                      selectedOption === opt.label
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="mr-3 font-bold text-indigo-600">
                      {opt.label}.
                    </span>
                    <RichText text={opt.text} />
                  </button>
                ))}
              </div>
            )}

            {problem.type === 'FILL_BLANK' && (
              <form onSubmit={handleFillSubmit} className="flex gap-3">
                <input
                  ref={fillInputRef}
                  type="text"
                  value={fillValue}
                  onChange={(e) => setFillValue(e.target.value)}
                  disabled={submitting}
                  placeholder="Your answer…"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={submitting || !fillValue.trim()}
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  Submit
                </button>
              </form>
            )}

            {problem.type === 'TRUE_FALSE' && (
              <div className="flex gap-4">
                {(['True', 'False'] as const).map((val) => (
                  <button
                    key={val}
                    disabled={submitting}
                    onClick={() => handleTrueFalse(val)}
                    className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-5 text-lg font-bold text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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

  // ── ANSWERED state ──────────────────────────────────────────────────────────

  const isCorrect = result?.correct ?? false;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link
          href="/learn"
          className="text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          ← Back to topics
        </Link>
      </header>

      <main className="mx-auto max-w-2xl p-8">
        {/* Feedback banner */}
        <div
          className={`mb-6 rounded-xl p-5 ${
            isCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <p
            className={`text-2xl font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isCorrect ? '✅ Correct!' : '❌ Not quite.'}
          </p>

          {!isCorrect && result && (
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-slate-600">
                <span className="font-semibold">Your answer:</span>{' '}
                {result.yourAnswer}
              </p>
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                Correct answer:{' '}
                <span className="font-normal">
                  <RichText text={result.correctAnswer} />
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Server error warning (non-blocking) */}
        {submitError && (
          <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {submitError}
          </div>
        )}

        {/* Solution card */}
        {result?.solution && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Solution
            </h2>
            <p className="leading-relaxed text-slate-700">
              <RichText text={result.solution} />
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {isCorrect ? (
            <>
              <button
                onClick={() => router.push('/learn')}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try Another Problem
              </button>
              <Link
                href="/learn"
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Topics
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleTryAgain}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
              <Link
                href="/learn"
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Topics
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
