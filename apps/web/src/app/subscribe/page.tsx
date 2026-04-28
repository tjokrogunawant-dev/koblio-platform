'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { createCheckoutSession } from '@/lib/api';

export default function SubscribePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  async function handleSubscribe() {
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const { url } = await createCheckoutSession(token);
      if (url) {
        window.location.href = url;
      } else {
        setComingSoon(true);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-5xl">⭐</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-800">Go Premium</h1>
          <p className="mt-3 text-slate-500">
            Unlock unlimited problems, detailed progress reports, and weekly digests
          </p>
        </div>

        <ul className="mb-8 space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> Unlimited practice problems
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> Detailed progress reports for each child
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> Weekly performance digest emails
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-500">✓</span> Priority support
          </li>
        </ul>

        {comingSoon ? (
          <div className="rounded-xl bg-indigo-50 p-5 text-center">
            <p className="font-semibold text-indigo-700">Coming soon!</p>
            <p className="mt-1 text-sm text-indigo-500">
              Payments are not yet active. Check back soon.
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Redirecting to checkout...' : 'Subscribe — $9.99/month'}
          </button>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}
