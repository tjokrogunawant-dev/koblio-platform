import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CoinCounter } from '@/components/gamification/coin-counter';
import { StreakBadge } from '@/components/gamification/streak-badge';

describe('CoinCounter', () => {
  it('renders the correct coin amount', () => {
    render(<CoinCounter coins={124} />);
    expect(screen.getByText('124')).toBeInTheDocument();
  });

  it('renders the coin emoji', () => {
    render(<CoinCounter coins={0} />);
    expect(screen.getByRole('img', { name: /coins/i })).toBeInTheDocument();
  });

  it('renders large numbers with locale formatting', () => {
    render(<CoinCounter coins={1500} />);
    // toLocaleString may produce "1,500" or "1500" depending on locale
    const el = screen.getByText(/1.?500/);
    expect(el).toBeInTheDocument();
  });
});

describe('StreakBadge', () => {
  it('shows flame emoji and day count for a non-zero streak', () => {
    render(<StreakBadge streakCount={5} />);
    expect(screen.getByRole('img', { name: /streak flame/i })).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('day streak')).toBeInTheDocument();
  });

  it('shows placeholder text when streak is 0', () => {
    render(<StreakBadge streakCount={0} />);
    expect(screen.getByText('Start a streak today!')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /streak flame/i })).not.toBeInTheDocument();
  });

  it('applies bold orange class for streak >= 7', () => {
    const { container } = render(<StreakBadge streakCount={7} />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-orange-600');
    expect(span?.className).toContain('font-bold');
  });

  it('does not apply orange class for streak < 7', () => {
    const { container } = render(<StreakBadge streakCount={3} />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('text-gray-600');
  });
});
