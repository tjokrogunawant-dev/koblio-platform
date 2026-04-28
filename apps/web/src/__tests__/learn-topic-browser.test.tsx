import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => ({ token: null, user: null }),
}));

jest.mock('@/lib/api', () => ({
  getProblemsByGrade: jest.fn(),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

import LearnPage from '@/app/learn/page';

describe('LearnPage — Topic Browser', () => {
  it('renders grade selection cards for grades 1, 2, and 3', () => {
    render(<LearnPage />);

    expect(screen.getByText('Grade 1')).toBeInTheDocument();
    expect(screen.getByText('Grade 2')).toBeInTheDocument();
    expect(screen.getByText('Grade 3')).toBeInTheDocument();
  });

  it('shows "Start Learning" heading on the grade step', () => {
    render(<LearnPage />);
    expect(screen.getByRole('heading', { name: /start learning/i })).toBeInTheDocument();
  });
});
