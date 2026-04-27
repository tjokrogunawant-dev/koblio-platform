'use client';

import { useEffect, useState } from 'react';

interface XPBarProps {
  xp: number;
  level: number;
  xpToNextLevel: number;
  progressPercent: number;
  leveledUp?: boolean;
}

export function XPBar({
  xp,
  level,
  xpToNextLevel,
  progressPercent,
  leveledUp = false,
}: XPBarProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (leveledUp) {
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [leveledUp]);

  const clampedPercent = Math.min(100, Math.max(0, progressPercent));

  return (
    <div className="w-full space-y-1">
      {showBanner && (
        <div className="rounded-lg bg-indigo-100 px-3 py-1.5 text-center text-sm font-bold text-indigo-700 animate-pulse">
          Level Up! 🎉
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-indigo-700">Level {level}</span>
        <span className="text-slate-500">
          {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-indigo-200">
        <div
          className="h-3 rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${clampedPercent}%` }}
          role="progressbar"
          aria-valuenow={xp}
          aria-valuemin={0}
          aria-valuemax={xpToNextLevel}
          aria-label={`XP progress: ${xp} of ${xpToNextLevel}`}
        />
      </div>
    </div>
  );
}
