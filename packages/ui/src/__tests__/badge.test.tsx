import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>Level 5</Badge>);
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-primary');
  });

  it('applies success variant', () => {
    render(<Badge variant="success" data-testid="badge">Pass</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-success');
  });

  it('applies warning variant', () => {
    render(<Badge variant="warning" data-testid="badge">Alert</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-warning');
  });

  it('applies destructive variant', () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-destructive');
  });

  it('applies outline variant', () => {
    render(<Badge variant="outline" data-testid="badge">Tag</Badge>);
    expect(screen.getByTestId('badge').className).toContain('border');
  });

  it('is pill-shaped (rounded-full)', () => {
    render(<Badge data-testid="badge">Pill</Badge>);
    expect(screen.getByTestId('badge').className).toContain('rounded-full');
  });

  it('merges custom className', () => {
    render(<Badge className="ml-2" data-testid="badge">X</Badge>);
    expect(screen.getByTestId('badge').className).toContain('ml-2');
  });
});
