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
import { registerStudent } from '@/lib/api';

export default function StudentRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<'code' | 'account'>('code');
  const [classCode, setClassCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (classCode.trim().length < 3) {
      setError('Please enter a valid class code.');
      return;
    }
    setError('');
    setStep('account');
  }

  async function handleAccountSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await registerStudent({
        classCode: classCode.trim().toUpperCase(),
        displayName: displayName.trim(),
        username: username.trim(),
        password,
      });
      login(result.access_token, result.user, result.expires_in);
      router.push('/profile/setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎒</div>
          <CardTitle className="text-2xl">Join Your Class</CardTitle>
          <CardDescription>
            {step === 'code'
              ? 'Enter the class code your teacher gave you'
              : 'Create your login details'}
          </CardDescription>
        </CardHeader>

        {step === 'code' ? (
          <form onSubmit={handleCodeSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Class Code</label>
                <Input
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="text-center text-lg font-mono tracking-widest uppercase"
                  maxLength={20}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Next
              </Button>
              <p className="text-sm text-slate-500">
                Ask your teacher for the class code if you don&apos;t have one.
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleAccountSubmit}>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-indigo-50 px-4 py-2 text-center text-sm text-indigo-700">
                Class code: <span className="font-mono font-bold">{classCode}</span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('code');
                    setError('');
                  }}
                  className="underline hover:no-underline"
                >
                  change
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Your Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={50}
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="e.g. alex1234"
                  maxLength={50}
                  autoComplete="username"
                />
                <p className="text-xs text-slate-400">Letters, numbers, and underscores only</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </CardFooter>
          </form>
        )}

        <div className="border-t px-6 py-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </main>
  );
}
