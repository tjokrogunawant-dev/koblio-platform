import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Toast, ToastTitle, ToastDescription } from '../toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with alert role', () => {
    render(<Toast>Message</Toast>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Toast>
        <ToastTitle>Success</ToastTitle>
        <ToastDescription>Your answer was correct!</ToastDescription>
      </Toast>,
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Your answer was correct!')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Toast variant="success">Done</Toast>);
    expect(screen.getByRole('alert').className).toContain('border-success');
  });

  it('auto-closes after duration', () => {
    render(<Toast duration={3000}>Auto close</Toast>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onClose when auto-closing', () => {
    const onClose = jest.fn();
    render(<Toast duration={2000} onClose={onClose}>Closing</Toast>);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when close button clicked', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Toast onClose={onClose} duration={0}>Closeable</Toast>);

    await user.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(<Toast open={false}>Hidden</Toast>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has rounded-2xl for child-friendly style', () => {
    render(<Toast>Round</Toast>);
    expect(screen.getByRole('alert').className).toContain('rounded-2xl');
  });
});
