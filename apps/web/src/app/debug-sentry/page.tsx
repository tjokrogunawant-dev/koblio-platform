'use client';

import { Button } from '@/components/ui/button';

export default function DebugSentryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Sentry Debug Page</h1>
      <p className="text-muted-foreground">
        Click the button to trigger a test error sent to Sentry.
      </p>
      <Button
        variant="destructive"
        onClick={() => {
          throw new Error('Sentry test error from Koblio Web');
        }}
      >
        Trigger Test Error
      </Button>
    </main>
  );
}
