import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Koblio</h1>
      <p className="text-lg text-muted-foreground">
        Gamified adaptive math learning for K-6 students.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
