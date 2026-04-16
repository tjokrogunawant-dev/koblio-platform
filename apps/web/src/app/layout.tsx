import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Koblio — Math Learning Platform',
  description: 'Gamified adaptive math learning for K-6 students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
