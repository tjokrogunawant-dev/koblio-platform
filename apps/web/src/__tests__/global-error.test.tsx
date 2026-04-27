import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const mockCaptureException = jest.fn();
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: mockCaptureException,
  captureRequestError: jest.fn(),
}));

import GlobalError from '@/app/global-error';

describe('GlobalError', () => {
  const error = new Error('test error');
  const reset = jest.fn();

  beforeEach(() => {
    mockCaptureException.mockClear();
    reset.mockClear();
  });

  it('renders error message and try again button', () => {
    render(<GlobalError error={error} reset={reset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('reports the error to Sentry', () => {
    render(<GlobalError error={error} reset={reset} />);
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it('calls reset when try again is clicked', async () => {
    const user = userEvent.setup();
    render(<GlobalError error={error} reset={reset} />);
    await user.click(screen.getByText('Try again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
