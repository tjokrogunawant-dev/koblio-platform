'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Your account details.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Name</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{user?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Role</p>
          <p className="mt-1 text-sm font-medium text-slate-800 capitalize">{user?.role ?? '—'}</p>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
