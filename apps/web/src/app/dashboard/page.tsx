'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getMyClassrooms, getMyAssignments } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardOverviewPage() {
  const { token, user } = useAuth();
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [activeClasses, setActiveClasses] = useState<number | null>(null);
  const [assignmentCount, setAssignmentCount] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyClassrooms(token)
      .then((data) => {
        setActiveClasses(data.length);
        setTotalStudents(data.reduce((sum, c) => sum + c.studentCount, 0));
      })
      .catch(() => {});
    getMyAssignments(token)
      .then((data) => setAssignmentCount(data.length))
      .catch(() => {});
  }, [token]);

  const stats = [
    { title: 'Total Students', value: totalStudents, description: 'Across all classes' },
    { title: 'Active Classes', value: activeClasses, description: 'This semester' },
    { title: 'Assignments', value: assignmentCount, description: 'Created so far' },
    { title: 'Avg. Mastery', value: '—', description: 'Class average P(known)' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name ?? 'Teacher'}.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-3xl">
                {stat.value === null ? '…' : stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
