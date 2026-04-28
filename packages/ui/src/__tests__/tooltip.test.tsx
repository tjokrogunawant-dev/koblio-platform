import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../tooltip';

describe('Tooltip', () => {
  it('does not render tooltip content initially', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('renders trigger element', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Info</TooltipTrigger>
          <TooltipContent>Details</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Help text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.hover(screen.getByText('Hover'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Help text');
  });
});
