import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Koblio — Math Learning Platform',
  description: 'Gamified adaptive math learning for K-6 students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
