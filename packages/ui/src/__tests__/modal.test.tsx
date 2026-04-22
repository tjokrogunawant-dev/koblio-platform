import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from '../modal';

describe('Modal', () => {
  it('does not render content when closed', () => {
    render(
      <Modal>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalTitle>Title</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(screen.queryByText('Title')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Modal open>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
            <ModalDescription>A description</ModalDescription>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('opens when trigger clicked', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <ModalTrigger>Open Me</ModalTrigger>
        <ModalContent>
          <ModalTitle>Opened</ModalTitle>
        </ModalContent>
      </Modal>,
    );

    await user.click(screen.getByText('Open Me'));
    expect(screen.getByText('Opened')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <Modal open>
        <ModalContent>
          <ModalTitle>T</ModalTitle>
          <ModalFooter data-testid="footer">
            <ModalClose>Cancel</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
