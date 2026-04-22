import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '../input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('accepts text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Name" />);
    const input = screen.getByPlaceholderText('Name');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('has 48dp height for touch targets', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('h-12');
  });

  it('has rounded-xl for child-friendly style', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input').className).toContain('rounded-xl');
  });

  it('supports disabled state', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('supports type prop', () => {
    render(<Input type="password" data-testid="pw" />);
    expect(screen.getByTestId('pw')).toHaveAttribute('type', 'password');
  });

  it('merges custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId('input').className).toContain('custom-class');
  });
});
