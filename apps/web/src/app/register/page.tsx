import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Sign Up — Koblio',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Join Koblio</h1>
        <p className="mt-2 text-slate-500">Who are you signing up as?</p>
      </div>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        <Card className="flex flex-col items-center gap-4 p-6 text-center hover:shadow-md transition-shadow">
          <CardHeader className="p-0">
            <div className="text-4xl">👨‍👩‍👧</div>
            <CardTitle className="mt-2 text-xl">I&apos;m a Parent</CardTitle>
            <CardDescription>
              Create an account and set up learning for your child
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/register/parent">Sign up as Parent</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center gap-4 p-6 text-center hover:shadow-md transition-shadow">
          <CardHeader className="p-0">
            <div className="text-4xl">👩‍🏫</div>
            <CardTitle className="mt-2 text-xl">I&apos;m a Teacher</CardTitle>
            <CardDescription>
              Manage your class and track student progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/register/teacher">Sign up as Teacher</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
