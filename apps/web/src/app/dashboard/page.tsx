import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const placeholderStats = [
  { title: 'Total Students', value: '—', description: 'Across all classes' },
  { title: 'Active Classes', value: '—', description: 'This semester' },
  {
    title: 'Assignments',
    value: '—',
    description: 'Created this week',
  },
  {
    title: 'Avg. Mastery',
    value: '—',
    description: 'Class average P(known)',
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your classes.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {placeholderStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
