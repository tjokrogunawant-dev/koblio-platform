import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary');
  });

  it('applies destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button').className).toContain('bg-destructive');
  });

  it('applies success variant', () => {
    render(<Button variant="success">Done</Button>);
    expect(screen.getByRole('button').className).toContain('bg-success');
  });

  it('applies warning variant', () => {
    render(<Button variant="warning">Warn</Button>);
    expect(screen.getByRole('button').className).toContain('bg-warning');
  });

  it('enforces 48dp minimum touch target', () => {
    render(<Button>Tap</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('min-h-12');
    expect(btn.className).toContain('min-w-12');
  });

  it('applies size variants', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('h-10');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('h-14');

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button').className).toContain('w-12');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as child element when asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/test');
  });

  it('is disabled when disabled prop set', () => {
    render(<Button disabled>No</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('merges custom className', () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole('button').className).toContain('my-custom');
  });

  it('has rounded-xl for child-friendly appearance', () => {
    render(<Button>Round</Button>);
    expect(screen.getByRole('button').className).toContain('rounded-xl');
  });
});
