'use client';

import type { Problem, Difficulty } from '@/lib/api';

interface DailyChallengeCardProps {
  problem: Problem | null;
  grade: number;
  onStart: () => void;
}

function difficultyBadgeClass(difficulty: Difficulty): string {
  const map: Record<Difficulty, string> = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD: 'bg-red-100 text-red-700',
  };
  return map[difficulty] ?? 'bg-slate-100 text-slate-700';
}

export function DailyChallengeCard({
  problem,
  grade,
  onStart,
}: DailyChallengeCardProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="daily challenge star">⭐</span>
          <div>
            <p className="font-bold text-slate-800">Daily Challenge</p>
            <p className="text-xs text-slate-500">Grade {grade}</p>
          </div>
        </div>
        {problem && (
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${difficultyBadgeClass(problem.difficulty)}`}
          >
            {problem.difficulty}
          </span>
        )}
      </div>

      {problem ? (
        <>
          <p className="mt-3 text-sm text-slate-700 line-clamp-2">
            {problem.questionText}
          </p>
          <button
            onClick={onStart}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          >
            Start Challenge →
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Come back tomorrow for a new challenge!
        </p>
      )}
    </div>
  );
}
