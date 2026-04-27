'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-xl font-bold text-indigo-600">Koblio</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome, {user?.name ?? 'Parent'}!
          </h1>
          <p className="mt-1 text-slate-500">
            Manage your children&apos;s learning from here.
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Your Children
          </h2>
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle className="text-base text-slate-500">
                No children yet
              </CardTitle>
              <CardDescription>
                Add your first child to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled
                title="Coming soon"
              >
                + Add Child
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
