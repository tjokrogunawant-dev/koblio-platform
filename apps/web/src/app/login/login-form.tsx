'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { loginParentTeacher, loginStudent } from '@/lib/api';
import { cn } from '@/lib/utils';

type Tab = 'adult' | 'student';

const roleRedirects = {
  parent: '/dashboard/parent',
  teacher: '/dashboard',
  student: '/dashboard/student',
} as const;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>('adult');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (tab === 'adult') {
        result = await loginParentTeacher(email, password);
      } else {
        result = await loginStudent(username, password);
      }

      login(result.access_token, result.user, result.expires_in);

      const redirect = roleRedirects[result.user.role];
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Koblio</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      {/* Role tabs */}
      <div className="mx-6 mb-2 flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => { setTab('adult'); setError(''); }}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'adult'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          Parent / Teacher
        </button>
        <button
          type="button"
          onClick={() => { setTab('student'); setError(''); }}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'student'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          Student
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {tab === 'adult' ? (
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
          <div className="flex w-full flex-col items-center gap-2 text-sm text-muted-foreground">
            <span>
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-indigo-600 hover:underline"
              >
                Sign up
              </Link>
            </span>
            <Link href="/" className="hover:text-foreground">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
