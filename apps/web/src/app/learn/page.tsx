'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { getProblemsByGrade, type Problem, type Difficulty } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'grade' | 'topics' | 'problems';

interface StrandGroup {
  strand: string;
  topics: TopicEntry[];
}

interface TopicEntry {
  topic: string;
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADES = [1, 2, 3];

function difficultyBadge(difficulty: Difficulty) {
  const map: Record<Difficulty, string> = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD: 'bg-red-100 text-red-700',
  };
  return map[difficulty] ?? 'bg-slate-100 text-slate-700';
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    MCQ: 'Multiple Choice',
    FILL_BLANK: 'Fill in the Blank',
    TRUE_FALSE: 'True / False',
  };
  return map[type] ?? type;
}

function groupByStrand(problems: Problem[]): StrandGroup[] {
  const strandMap = new Map<string, Map<string, number>>();

  for (const p of problems) {
    if (!strandMap.has(p.strand)) strandMap.set(p.strand, new Map());
    const topicMap = strandMap.get(p.strand)!;
    topicMap.set(p.topic, (topicMap.get(p.topic) ?? 0) + 1);
  }

  return Array.from(strandMap.entries()).map(([strand, topicMap]) => ({
    strand,
    topics: Array.from(topicMap.entries()).map(([topic, count]) => ({
      topic,
      count,
    })),
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LearnPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState<Step>('grade');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strandGroups = groupByStrand(allProblems);
  const filteredProblems = selectedTopic
    ? allProblems.filter((p) => p.topic === selectedTopic)
    : [];

  async function handleSelectGrade(grade: number) {
    setSelectedGrade(grade);
    setStep('topics');
    setLoading(true);
    setError(null);
    try {
      const data = await getProblemsByGrade(grade, token ?? undefined);
      setAllProblems(data);
    } catch {
      setError('Could not load topics. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTopic(topic: string) {
    setSelectedTopic(topic);
    setStep('problems');
  }

  function handleBackToGrades() {
    setStep('grade');
    setSelectedGrade(null);
    setSelectedTopic(null);
    setAllProblems([]);
  }

  function handleBackToTopics() {
    setStep('topics');
    setSelectedTopic(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link href="/dashboard/student" className="text-xl font-bold text-indigo-600">
          Koblio
        </Link>
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={handleBackToGrades}
            className={step === 'grade' ? 'font-semibold text-indigo-600' : 'hover:text-indigo-600'}
          >
            Grades
          </button>
          {(step === 'topics' || step === 'problems') && (
            <>
              <span>/</span>
              <button
                onClick={handleBackToTopics}
                className={
                  step === 'topics' ? 'font-semibold text-indigo-600' : 'hover:text-indigo-600'
                }
              >
                Grade {selectedGrade}
              </button>
            </>
          )}
          {step === 'problems' && (
            <>
              <span>/</span>
              <span className="font-semibold text-indigo-600">{selectedTopic}</span>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl p-8">
        {/* ── Step 1: Grade Selection ── */}
        {step === 'grade' && (
          <section>
            <h1 className="mb-2 text-3xl font-bold text-slate-800">Start Learning</h1>
            <p className="mb-8 text-slate-500">Choose your grade to explore topics.</p>
            <div className="grid gap-6 sm:grid-cols-3">
              {GRADES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleSelectGrade(grade)}
                  className="group rounded-xl border-2 border-slate-200 bg-white p-8 text-center shadow-md transition hover:border-indigo-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="block text-6xl font-extrabold text-indigo-500 group-hover:text-indigo-600">
                    {grade}
                  </span>
                  <span className="mt-3 block text-lg font-semibold text-slate-700">
                    Grade {grade}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Step 2: Strand/Topic Selection ── */}
        {step === 'topics' && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={handleBackToGrades}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ← Back to Grades
              </button>
              <h1 className="text-2xl font-bold text-slate-800">Grade {selectedGrade} Topics</h1>
            </div>

            {loading && <div className="text-center py-16 text-slate-500">Loading topics…</div>}

            {error && <div className="rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

            {!loading && !error && strandGroups.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                No topics available for this grade yet.
              </div>
            )}

            {!loading &&
              !error &&
              strandGroups.map(({ strand, topics }) => (
                <div key={strand} className="mb-8">
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                    {strand}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {topics.map(({ topic, count }) => (
                      <button
                        key={topic}
                        onClick={() => handleSelectTopic(topic)}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className="font-medium text-slate-800">{topic}</span>
                        <span className="ml-3 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {count} {count === 1 ? 'problem' : 'problems'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </section>
        )}

        {/* ── Step 3: Problem List ── */}
        {step === 'problems' && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={handleBackToTopics}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ← Back to Topics
              </button>
              <h1 className="text-2xl font-bold text-slate-800">{selectedTopic}</h1>
            </div>

            {filteredProblems.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                No problems available for this topic yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProblems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => router.push(`/learn/problem/${problem.id}`)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-6 text-left shadow-md hover:border-indigo-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyBadge(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {typeLabel(problem.type)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-700">{problem.questionText}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
