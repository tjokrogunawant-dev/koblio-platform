import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          Koblio
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Gamified adaptive math learning for K-6 students.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Teacher Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Parent Login</Link>
        </Button>
      </div>
    </main>
  );
}
