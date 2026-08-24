import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './editLUKSEncryptionPasswords.mocks';

import EditLUKSEncryptionPasswords from '../EditLUKSEncryptionPasswords';

import { closeOverlay, mockPlan } from './editLUKSEncryptionPasswords.fixtures';
import {
  mockGetLUKSSecretName,
  mockGetNamespace,
  mockGetPlanVirtualMachines,
  mockOnDiskDecryptionConfirm,
  mockUseK8sWatchResource,
} from './editLUKSEncryptionPasswords.mocks';

describe('EditLUKSEncryptionPasswords - NBDE and passphrases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockGetNamespace.mockReturnValue('test-namespace');
    mockGetPlanVirtualMachines.mockReturnValue([]);
    mockUseK8sWatchResource.mockReturnValue([{ data: {} }, true, null]);
  });

  it('initializes NBDE state from VM data', () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: true }]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    expect(checkbox).toBeChecked();
  });

  it('toggles NBDE checkbox', async () => {
    const user = userEvent.setup();
    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('shows passphrase fields when NBDE is disabled', () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(screen.getByText('Passphrases for LUKS encrypted devices')).toBeInTheDocument();
    expect(screen.getByTestId('luks-passphrase-input-list')).toBeInTheDocument();
  });

  it('hides passphrase fields when NBDE is enabled', async () => {
    const user = userEvent.setup();
    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);

    expect(screen.queryByText('Passphrases for LUKS encrypted devices')).not.toBeInTheDocument();
  });

  it('loads existing passphrases from secret', async () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);
    mockUseK8sWatchResource.mockReturnValue([
      { data: { pass1: btoa('test-pass-1'), pass2: btoa('test-pass-2') } },
      true,
      null,
    ]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByText('Passphrases: test-pass-1, test-pass-2')).toBeInTheDocument();
    });
  });

  it('clears passphrases when NBDE is enabled', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([{ data: { pass1: btoa('test-pass') } }, true, null]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByText('Passphrases: test-pass')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);
    await user.click(checkbox);

    expect(screen.getByText(/Passphrases:/)).toBeInTheDocument();
  });

  it('submits form with correct NBDE state', async () => {
    const user = userEvent.setup();
    const watchedSecret = { data: {} } as IoK8sApiCoreV1Secret;
    mockUseK8sWatchResource.mockReturnValue([watchedSecret, true, null]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);

    const confirmButton = screen.getByRole('button', { name: /save/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDiskDecryptionConfirm).toHaveBeenCalledWith({
        currentSecret: watchedSecret,
        nbdeClevis: true,
        newValue: JSON.stringify([]),
        resource: mockPlan,
      });
    });
  });

  it('passes labeled current secret when saving passphrases after source-secret copy', async () => {
    const user = userEvent.setup();
    const labeledSecret = {
      data: { 0: btoa('copied-pass') },
      metadata: {
        labels: { [SOURCE_SECRET_LABEL]: 'source-luks-secret' },
        name: 'test-secret',
      },
    } as unknown as IoK8sApiCoreV1Secret;
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);
    mockUseK8sWatchResource.mockReturnValue([labeledSecret, true, null]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Use an existing secret')).toBeChecked();
    });

    await user.click(screen.getByLabelText('Enter passphrases'));

    await waitFor(() => {
      expect(screen.getByText('Passphrases: copied-pass')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnDiskDecryptionConfirm).toHaveBeenCalledWith({
        currentSecret: labeledSecret,
        nbdeClevis: false,
        newValue: JSON.stringify(['copied-pass']),
        resource: mockPlan,
      });
    });
  });

  it('shows alert for mismatched LUKS settings', () => {
    mockGetLUKSSecretName.mockReturnValue('secret-1');
    mockGetPlanVirtualMachines.mockReturnValue([
      { luks: { name: 'secret-1' } },
      { luks: { name: 'secret-2' } },
    ]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(screen.getByTestId('luks-modal-alert')).toBeInTheDocument();
  });
});
