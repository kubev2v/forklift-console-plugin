import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './vmCutoverMigrationModal.mocks';

import VmCutoverMigrationModal from '../VmCutoverMigrationModal';

import {
  inheritingMigration,
  mockPatchMigrationVmCutover,
  overriddenMigration,
  VM_ID,
  VM_NAME,
} from './vmCutoverMigrationModal.mocks';

const ASAP_RADIO = 'cutover-mode-asap';
const INHERIT_RADIO = 'cutover-mode-inherit';
const SCHEDULED_RADIO = 'cutover-mode-scheduled';

const closeOverlay = jest.fn();

const renderModal = (migration = inheritingMigration): void => {
  render(
    <VmCutoverMigrationModal
      closeOverlay={closeOverlay}
      migration={migration}
      vmId={VM_ID}
      vmName={VM_NAME}
    />,
  );
};

const confirmButton = (): HTMLElement => screen.getByTestId('modal-confirm-button');

describe('VmCutoverMigrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers all three modes, including the inherit option the plan modal lacks', () => {
    renderModal();

    expect(screen.getByTestId(ASAP_RADIO)).toBeInTheDocument();
    expect(screen.getByTestId(SCHEDULED_RADIO)).toBeInTheDocument();
    expect(screen.getByTestId(INHERIT_RADIO)).toBeChecked();
  });

  it('schedules a cutover for the VM', async () => {
    const user = userEvent.setup();
    renderModal();

    // An inheriting VM opens on the inherit radio, so ASAP has to be chosen explicitly.
    await user.click(screen.getByTestId(ASAP_RADIO));
    await user.click(confirmButton());

    const [migration, vmId, cutover] = mockPatchMigrationVmCutover.mock.calls[0] as unknown[];
    expect(migration).toBe(inheritingMigration);
    expect(vmId).toBe(VM_ID);
    expect(typeof cutover).toBe('string');
  });

  it('removes the override when confirming in inherit mode', async () => {
    const user = userEvent.setup();
    renderModal(overriddenMigration);

    await user.click(screen.getByTestId(INHERIT_RADIO));
    expect(confirmButton()).toHaveTextContent('Remove cutover');

    await user.click(confirmButton());

    expect(mockPatchMigrationVmCutover).toHaveBeenCalledWith(
      overriddenMigration,
      VM_ID,
      undefined,
      expect.anything(),
    );
  });
});
