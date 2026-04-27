import { type BadgeDto } from '@/lib/api';

interface BadgeShelfProps {
  badges: BadgeDto[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BadgeShelf({ badges }: BadgeShelfProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Your Badges 🏅</h2>

      {badges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
          <p className="text-slate-500">No badges yet — keep solving problems!</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="group/badge relative flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-3xl leading-none">{badge.iconEmoji}</span>
              <span className="text-center text-xs font-medium text-slate-700">
                {badge.name}
              </span>

              {/* Tooltip — appears above the card on hover */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg opacity-0 transition-opacity group-hover/badge:opacity-100">
                <p className="text-xs text-slate-700">{badge.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Earned: {formatDate(badge.awardedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
