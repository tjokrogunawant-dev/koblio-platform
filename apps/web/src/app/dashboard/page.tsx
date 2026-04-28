import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MathRenderer } from '@koblio/ui';

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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Math Rendering Demo</h2>
        <Card>
          <CardHeader>
            <CardTitle>KaTeX Examples</CardTitle>
            <CardDescription>Inline and display math rendering powered by KaTeX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-20">Inline:</span>
              <MathRenderer expression="x^2 + y^2 = z^2" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-20">Display:</span>
              <MathRenderer expression="\frac{-b \pm \sqrt{b^2-4ac}}{2a}" display />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-20">Inline:</span>
              <MathRenderer expression="\sqrt{16} = 4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
