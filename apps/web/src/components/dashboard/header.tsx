'use client';

import { LogOut, User } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <h2 className="text-lg font-semibold text-foreground">Teacher Dashboard</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Teacher</span>
        </div>
        <Button variant="ghost" size="icon" aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
