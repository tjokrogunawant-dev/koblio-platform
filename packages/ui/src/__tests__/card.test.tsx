import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card', () => {
  it('renders Card with children', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveTextContent('Content');
  });

  it('has rounded-2xl for bubbly appearance', () => {
    render(<Card data-testid="card">Hi</Card>);
    expect(screen.getByTestId('card').className).toContain('rounded-2xl');
  });

  it('has shadow for visual depth', () => {
    render(<Card data-testid="card">Hi</Card>);
    expect(screen.getByTestId('card').className).toContain('shadow-md');
  });

  it('renders full card structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Title</CardTitle>
          <CardDescription data-testid="desc">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Body</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('Title');
    expect(screen.getByTestId('desc')).toHaveTextContent('Description');
    expect(screen.getByTestId('content')).toHaveTextContent('Body');
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer');
  });

  it('merges custom className', () => {
    render(<Card className="extra" data-testid="card">Hi</Card>);
    expect(screen.getByTestId('card').className).toContain('extra');
  });
});
