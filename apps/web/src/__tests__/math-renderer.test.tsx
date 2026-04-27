import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-katex and katex CSS since they are not available in jsdom
jest.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => (
    <span data-testid="inline-math">{math}</span>
  ),
  BlockMath: ({ math }: { math: string }) => (
    <div data-testid="block-math">{math}</div>
  ),
}));

jest.mock('katex/dist/katex.min.css', () => ({}));

// Import after mocks are set up
import { MathRenderer } from '@koblio/ui';

describe('MathRenderer', () => {
  it('renders inline math without throwing for a valid expression', () => {
    render(<MathRenderer expression="x^2 + y^2 = z^2" />);
    expect(screen.getByTestId('inline-math')).toBeInTheDocument();
    expect(screen.getByTestId('inline-math')).toHaveTextContent('x^2 + y^2 = z^2');
  });

  it('renders block math when display prop is true', () => {
    render(<MathRenderer expression="\frac{a}{b}" display />);
    expect(screen.getByTestId('block-math')).toBeInTheDocument();
    expect(screen.getByTestId('block-math')).toHaveTextContent('\\frac{a}{b}');
  });

  it('applies custom className to the wrapper span', () => {
    const { container } = render(
      <MathRenderer expression="\sqrt{16}" className="custom-math" />,
    );
    const span = container.querySelector('span.custom-math');
    expect(span).toBeInTheDocument();
  });

  it('defaults display to false (inline)', () => {
    render(<MathRenderer expression="\sqrt{4}" />);
    expect(screen.getByTestId('inline-math')).toBeInTheDocument();
    expect(screen.queryByTestId('block-math')).not.toBeInTheDocument();
  });
});
