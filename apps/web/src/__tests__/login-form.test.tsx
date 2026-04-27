import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from '@/app/login/login-form';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock auth provider
jest.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => ({ login: jest.fn(), user: null, token: null, logout: jest.fn() }),
}));

// Mock api
jest.mock('@/lib/api', () => ({
  loginParentTeacher: jest.fn(),
  loginStudent: jest.fn(),
}));

describe('LoginForm', () => {
  it('renders the Parent / Teacher tab by default with email field', () => {
    render(<LoginForm />);

    // Parent/Teacher tab should be active by default
    const adultTab = screen.getByRole('button', { name: /parent \/ teacher/i });
    expect(adultTab).toBeInTheDocument();

    // Email field should be visible
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // Username field should NOT be visible
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
  });

  it('shows username field instead of email field when switching to Student tab', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Initially email is shown
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // Click Student tab
    const studentTab = screen.getByRole('button', { name: /student/i });
    await user.click(studentTab);

    // Now username should be shown
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();

    // Email should no longer be shown
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });
});
