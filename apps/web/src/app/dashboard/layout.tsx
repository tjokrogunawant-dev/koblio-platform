import { DashboardSidebar } from './dashboard-sidebar';

export const metadata = {
  title: 'Dashboard — Koblio',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
