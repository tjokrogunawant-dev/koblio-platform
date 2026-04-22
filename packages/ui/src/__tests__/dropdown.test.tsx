import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '../dropdown';

describe('Dropdown', () => {
  it('does not render content when closed', () => {
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('opens when trigger clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownLabel>Options</DropdownLabel>
          <DropdownSeparator />
          <DropdownItem>Profile</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    await user.click(screen.getByText('Menu'));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('renders trigger button', () => {
    render(
      <Dropdown>
        <DropdownTrigger>Actions</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Do thing</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
