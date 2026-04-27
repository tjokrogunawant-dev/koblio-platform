import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureRequestError: jest.fn(),
}));

import DebugSentryPage from '@/app/debug-sentry/page';

describe('DebugSentryPage', () => {
  it('renders heading and description text', () => {
    render(<DebugSentryPage />);
    expect(screen.getByText('Sentry Debug Page')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Click the button to trigger a test error sent to Sentry.',
      ),
    ).toBeInTheDocument();
  });

  it('renders a destructive trigger button', () => {
    render(<DebugSentryPage />);
    const button = screen.getByRole('button', { name: 'Trigger Test Error' });
    expect(button).toBeInTheDocument();
  });
});
