import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar', () => {
  it('renders avatar container', () => {
    render(<Avatar data-testid="avatar" />);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('is circular (rounded-full)', () => {
    render(<Avatar data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('rounded-full');
  });

  it('applies size variants', () => {
    const { rerender } = render(<Avatar size="sm" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('h-8');

    rerender(<Avatar size="md" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('h-12');

    rerender(<Avatar size="lg" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('h-16');

    rerender(<Avatar size="xl" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('h-24');
  });

  it('renders fallback text', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders image with alt text', () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="John Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
  });

  it('hides image and shows fallback on error', () => {
    render(
      <Avatar>
        <AvatarImage src="/broken.png" alt="Broken" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );
    fireEvent.error(screen.getByAltText('Broken'));
    expect(screen.queryByAltText('Broken')).not.toBeInTheDocument();
    expect(screen.getByText('FB')).toBeInTheDocument();
  });
});
