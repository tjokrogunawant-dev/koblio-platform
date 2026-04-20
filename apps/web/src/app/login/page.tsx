import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your Koblio account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input type="text" placeholder="Username or email" />
          <Input type="password" placeholder="Password" />
          <Button className="w-full">Sign In</Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
