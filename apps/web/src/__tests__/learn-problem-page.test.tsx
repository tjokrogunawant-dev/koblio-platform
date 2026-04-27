import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ id: 'test-problem-1' }),
}));

jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => ({ token: 'mock-token', user: null }),
}));

jest.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => (
    <span data-testid="inline-math">{math}</span>
  ),
  BlockMath: ({ math }: { math: string }) => (
    <div data-testid="block-math">{math}</div>
  ),
}));

jest.mock('katex/dist/katex.min.css', () => ({}));

// We need to mock @koblio/ui before importing the page
jest.mock('@koblio/ui', () => ({
  MathRenderer: ({ expression }: { expression: string }) => (
    <span data-testid="math-renderer">{expression}</span>
  ),
}));

const mockMCQProblem = {
  id: 'test-problem-1',
  grade: 2,
  strand: 'Number & Operations',
  topic: 'Addition',
  type: 'MCQ' as const,
  difficulty: 'EASY' as const,
  questionText: 'What is 2 + 2?',
  options: [
    { label: 'A', text: '3' },
    { label: 'B', text: '4' },
    { label: 'C', text: '5' },
    { label: 'D', text: '6' },
  ],
  correctAnswer: 'B',
  solution: '2 + 2 = 4',
  hints: ['Try counting on your fingers'],
};

jest.mock('@/lib/api', () => ({
  getProblem: jest.fn().mockResolvedValue(mockMCQProblem),
  submitAnswer: jest.fn(),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

import ProblemPage from '@/app/learn/problem/[id]/page';

describe('ProblemPage — MCQ renderer', () => {
  it('shows MCQ option buttons when problem type is MCQ', async () => {
    render(<ProblemPage />);

    // Wait for the problem to load and options to appear
    await waitFor(() => {
      expect(screen.getByText(/what is 2 \+ 2/i)).toBeInTheDocument();
    });

    // All 4 MCQ options should be rendered
    expect(screen.getByText('A.')).toBeInTheDocument();
    expect(screen.getByText('B.')).toBeInTheDocument();
    expect(screen.getByText('C.')).toBeInTheDocument();
    expect(screen.getByText('D.')).toBeInTheDocument();

    // Option text
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('shows hint button in the header', async () => {
    render(<ProblemPage />);

    await waitFor(() => {
      expect(screen.getByText(/what is 2 \+ 2/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument();
  });
});
