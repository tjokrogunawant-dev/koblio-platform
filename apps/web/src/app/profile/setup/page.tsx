'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AVATAR_MAP } from '@/components/avatar';
import { useAuth } from '@/components/providers/auth-provider';
import { updateProfile } from '@/lib/api';

const AVATAR_SLUGS = Object.keys(AVATAR_MAP) as Array<keyof typeof AVATAR_MAP>;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, token, updateUser } = useAuth();

  const [selected, setSelected] = useState<string | null>(
    user?.avatarSlug ?? null,
  );
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  async function handleSave() {
    if (!selected || !token || displayName.trim().length < 2) return;
    setSaving(true);
    setError(null);
    try {
      const result = await updateProfile(
        { displayName: displayName.trim(), avatarSlug: selected ?? undefined },
        token,
      );
      updateUser({ name: result.displayName, avatarSlug: result.avatarSlug ?? undefined });
      router.push('/dashboard/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Set up your profile
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Confirm your name and pick a character that represents you!
          </p>

          {/* Display name input */}
          <div className="mb-6">
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your display name"
            />
            {displayName.trim().length > 0 && displayName.trim().length < 2 && (
              <p className="mt-1 text-xs text-red-500">Name must be at least 2 characters.</p>
            )}
          </div>

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
              disabled={!selected || saving || displayName.trim().length < 2}
              className="flex-1"
            >
              {saving ? 'Saving…' : 'Save Profile'}
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
