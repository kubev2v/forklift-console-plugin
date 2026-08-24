import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './editLUKSEncryptionPasswords.mocks';

import EditLUKSEncryptionPasswords from '../EditLUKSEncryptionPasswords';

import {
  closeOverlay,
  mockPlan,
  planOwnedSecretWithSourceLabel,
  sourceSecret,
} from './editLUKSEncryptionPasswords.fixtures';
import {
  mockGetLUKSSecretName,
  mockGetNamespace,
  mockGetPlanVirtualMachines,
  mockOnDiskDecryptionConfirm,
  mockUseK8sWatchResource,
} from './editLUKSEncryptionPasswords.mocks';

describe('EditLUKSEncryptionPasswords - source secret', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockGetNamespace.mockReturnValue('test-namespace');
    mockGetPlanVirtualMachines.mockReturnValue([]);
    mockUseK8sWatchResource.mockReturnValue([{ data: {} }, true, null]);
  });

  it('pre-populates existing secret from source-secret label and enables Save', async () => {
    const user = userEvent.setup();
    mockGetPlanVirtualMachines.mockReturnValue([
      { luks: { name: 'test-secret' }, nbdeClevis: false },
    ]);

    mockUseK8sWatchResource.mockImplementation((resource) => {
      if (!resource) {
        return [undefined, true, null];
      }

      if (resource.name === 'test-secret') {
        return [planOwnedSecretWithSourceLabel, true, null];
      }

      if (resource.name === 'luks-source') {
        return [sourceSecret, true, null];
      }

      return [undefined, true, null];
    });

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-use-existing-secret-radio')).toBeChecked();
    });

    expect(screen.getByTestId('edit-luks-secret-select')).toHaveTextContent(
      'Selected: luks-source',
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnDiskDecryptionConfirm).toHaveBeenCalledWith({
        existingSecret: sourceSecret,
        labeledSourceSecretName: 'luks-source',
        nbdeClevis: false,
        newValue: JSON.stringify([]),
        resource: mockPlan,
      });
    });
  });

  it('falls back to passphrases when labeled source secret is missing', async () => {
    mockGetPlanVirtualMachines.mockReturnValue([
      { luks: { name: 'test-secret' }, nbdeClevis: false },
    ]);

    mockUseK8sWatchResource.mockImplementation((resource) => {
      if (!resource) {
        return [undefined, true, null];
      }

      if (resource.name === 'test-secret') {
        return [planOwnedSecretWithSourceLabel, true, null];
      }

      if (resource.name === 'luks-source') {
        return [undefined, true, { code: 404, message: 'NotFound' }];
      }

      return [undefined, true, null];
    });

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-use-passphrases-radio')).toBeChecked();
    });

    expect(screen.getByTestId('edit-luks-source-secret-unavailable-alert')).toBeInTheDocument();
    expect(screen.getByTestId('luks-passphrase-input-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });
});
