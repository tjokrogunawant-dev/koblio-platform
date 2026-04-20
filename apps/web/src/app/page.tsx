import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Koblio</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Gamified adaptive math learning for K-6 students.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Teacher Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
