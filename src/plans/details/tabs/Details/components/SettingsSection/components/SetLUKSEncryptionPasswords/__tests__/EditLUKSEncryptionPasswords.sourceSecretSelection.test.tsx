import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
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

describe('EditLUKSEncryptionPasswords - source secret selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockGetNamespace.mockReturnValue('test-namespace');
    mockGetPlanVirtualMachines.mockReturnValue([]);
    mockUseK8sWatchResource.mockReturnValue([{ data: {} }, true, null]);
  });

  it('does not overwrite a manual secret pick when the source watch resolves later', async () => {
    const user = userEvent.setup();
    mockGetPlanVirtualMachines.mockReturnValue([
      { luks: { name: 'test-secret' }, nbdeClevis: false },
    ]);

    let sourceWatchResult: [IoK8sApiCoreV1Secret | undefined, boolean, unknown] = [
      undefined,
      false,
      null,
    ];

    mockUseK8sWatchResource.mockImplementation((resource) => {
      if (!resource) {
        return [undefined, true, null];
      }

      if (resource.name === 'test-secret') {
        return [planOwnedSecretWithSourceLabel, true, null];
      }

      if (resource.name === 'luks-source') {
        return sourceWatchResult;
      }

      return [undefined, true, null];
    });

    const { rerender } = render(
      <EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('edit-use-existing-secret-radio')).toBeChecked();
    });

    expect(screen.getByTestId('edit-luks-secret-select')).toHaveTextContent('Selected: none');

    await user.click(screen.getByTestId('select-manual-luks-secret'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-luks-secret-select')).toHaveTextContent(
        'Selected: manual-luks',
      );
    });

    sourceWatchResult = [sourceSecret, true, null];
    rerender(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-luks-secret-select')).toHaveTextContent(
        'Selected: manual-luks',
      );
    });

    expect(screen.getByTestId('edit-use-existing-secret-radio')).toBeChecked();
    expect(
      screen.queryByTestId('edit-luks-source-secret-unavailable-alert'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnDiskDecryptionConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          labeledSourceSecretName: undefined,
        }),
      );
    });
  });

  it('does not treat a permission error as a missing source secret', async () => {
    mockGetPlanVirtualMachines.mockReturnValue([
      { luks: { name: 'test-secret' }, nbdeClevis: false },
    ]);

    let sourceWatchResult: [IoK8sApiCoreV1Secret | undefined, boolean, unknown] = [
      undefined,
      true,
      { code: 403, message: 'Forbidden' },
    ];

    mockUseK8sWatchResource.mockImplementation((resource) => {
      if (!resource) {
        return [undefined, true, null];
      }

      if (resource.name === 'test-secret') {
        return [planOwnedSecretWithSourceLabel, true, null];
      }

      if (resource.name === 'luks-source') {
        return sourceWatchResult;
      }

      return [undefined, true, null];
    });

    const { rerender } = render(
      <EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('edit-use-existing-secret-radio')).toBeChecked();
    });

    expect(
      screen.queryByTestId('edit-luks-source-secret-unavailable-alert'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

    sourceWatchResult = [sourceSecret, true, null];
    rerender(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-luks-secret-select')).toHaveTextContent(
        'Selected: luks-source',
      );
    });

    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });
});
