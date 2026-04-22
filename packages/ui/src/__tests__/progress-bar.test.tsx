import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  it('renders with progressbar role', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow correctly', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('sets aria-valuemin and aria-valuemax', () => {
    render(<ProgressBar value={50} max={200} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '200');
  });

  it('clamps percentage to 0-100', () => {
    const { container } = render(<ProgressBar value={150} max={100} />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('handles zero value', () => {
    const { container } = render(<ProgressBar value={0} />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('handles negative value (clamped to 0)', () => {
    const { container } = render(<ProgressBar value={-10} />);
    const fill = container.querySelector('[style]');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={42} showLabel />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<ProgressBar value={42} />);
    expect(screen.queryByText('42%')).not.toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    const fill = container.querySelector('[style]');
    expect(fill?.className).toContain('bg-success');
  });

  it('has rounded-full for child-friendly design', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar').className).toContain('rounded-full');
  });
});
