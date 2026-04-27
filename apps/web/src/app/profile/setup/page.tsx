'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AVATAR_MAP } from '@/components/avatar';
import { useAuth } from '@/components/providers/auth-provider';
import { updateAvatar } from '@/lib/api';

const AVATAR_SLUGS = Object.keys(AVATAR_MAP) as Array<keyof typeof AVATAR_MAP>;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [selected, setSelected] = useState<string | null>(
    user?.avatarSlug ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!selected || !token) return;
    setSaving(true);
    setError(null);
    try {
      await updateAvatar(selected, token);
      router.push('/dashboard/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save avatar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Choose your avatar
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Pick a character that represents you!
          </p>

          {/* Avatar grid — 4 per row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {AVATAR_SLUGS.map((slug) => {
              const isSelected = selected === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelected(slug)}
                  className={[
                    'flex flex-col items-center gap-2 rounded-xl p-3 border-2 transition-all',
                    'hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 bg-white',
                  ].join(' ')}
                  aria-pressed={isSelected}
                  aria-label={`Select ${slug} avatar`}
                >
                  <Avatar slug={slug} size="lg" />
                  <span className="text-xs font-medium text-slate-700 capitalize">
                    {slug}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!selected || saving}
              className="flex-1"
            >
              {saving ? 'Saving…' : 'Save Avatar'}
            </Button>
            <Link
              href="/dashboard/student"
              className="text-sm text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              Skip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
