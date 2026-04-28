'use client';

import type { LeaderboardEntry } from '@/lib/api';

interface LeaderboardWidgetProps {
  leaderboard: LeaderboardEntry[];
  currentStudentId: string;
  myRank: number;
}

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return String(rank);
}

export function LeaderboardWidget({
  leaderboard,
  currentStudentId,
  myRank,
}: LeaderboardWidgetProps) {
  const top10 = leaderboard.slice(0, 10);
  const myEntryInTop10 = top10.some((e) => e.studentId === currentStudentId);
  const myEntry = leaderboard.find((e) => e.studentId === currentStudentId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-800">This Week&apos;s Top Students</h2>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-2 w-12">Rank</th>
            <th className="px-5 py-2">Student</th>
            <th className="px-5 py-2 text-right">Coins</th>
          </tr>
        </thead>
        <tbody>
          {top10.map((entry) => {
            const isCurrent = entry.studentId === currentStudentId;
            return (
              <tr
                key={entry.studentId}
                className={`border-b border-slate-50 last:border-0 ${
                  isCurrent ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
              >
                <td className="px-5 py-3 font-semibold text-slate-700">{rankMedal(entry.rank)}</td>
                <td className="px-5 py-3 text-slate-700">
                  {entry.displayName}
                  {isCurrent && (
                    <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                      You
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-yellow-600">
                  🪙 {entry.weeklyCoins.toLocaleString()}
                </td>
              </tr>
            );
          })}

          {!myEntryInTop10 && myEntry && (
            <>
              <tr>
                <td colSpan={3} className="px-5 py-2 text-center text-slate-400 text-xs">
                  •••
                </td>
              </tr>
              <tr className="bg-indigo-50">
                <td className="px-5 py-3 font-semibold text-slate-700">{myRank}</td>
                <td className="px-5 py-3 text-slate-700">
                  {myEntry.displayName}
                  <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                    You
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-semibold text-yellow-600">
                  🪙 {myEntry.weeklyCoins.toLocaleString()}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
