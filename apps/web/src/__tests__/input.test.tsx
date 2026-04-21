import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports different types', () => {
    render(<Input type="email" data-testid="email-input" />);
    expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="custom-input" />);
    expect(screen.getByTestId('custom-input')).toHaveClass('custom-class');
  });
});
