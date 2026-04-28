import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-50 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-indigo-600">Koblio</h1>
        <p className="max-w-md text-xl font-semibold text-slate-800">
          Math Learning That Adapts to Your Child
        </p>
        <p className="max-w-md text-base text-slate-500">
          Gamified, personalised math practice for K-6 students. Powered by spaced repetition and
          real-time mastery tracking.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/register">Get Started (It&apos;s Free)</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </main>
  );
}
