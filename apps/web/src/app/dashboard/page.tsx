import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>Manage your classrooms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No classes yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>View student progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No students enrolled.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Create and track assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No assignments created.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
