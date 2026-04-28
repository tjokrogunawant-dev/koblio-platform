'use client';

interface StreakBadgeProps {
  streakCount: number;
}

export function StreakBadge({ streakCount }: StreakBadgeProps) {
  if (streakCount === 0) {
    return <span className="text-sm text-gray-500">Start a streak today!</span>;
  }

  return (
    <span
      className={`flex items-center gap-1 font-semibold ${
        streakCount >= 7 ? 'font-bold text-orange-600' : 'text-gray-600'
      }`}
    >
      <span role="img" aria-label="streak flame">
        🔥
      </span>
      <span>{streakCount}</span>
      <span className="font-normal">day streak</span>
    </span>
  );
}
