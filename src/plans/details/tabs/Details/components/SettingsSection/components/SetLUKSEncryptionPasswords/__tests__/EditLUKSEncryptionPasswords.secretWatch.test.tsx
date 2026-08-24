import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import './editLUKSEncryptionPasswords.mocks';

import EditLUKSEncryptionPasswords from '../EditLUKSEncryptionPasswords';

import { closeOverlay, mockPlan } from './editLUKSEncryptionPasswords.fixtures';
import {
  mockGetLUKSSecretName,
  mockGetNamespace,
  mockGetPlanVirtualMachines,
  mockUseK8sWatchResource,
} from './editLUKSEncryptionPasswords.mocks';

describe('EditLUKSEncryptionPasswords - secret watch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockGetNamespace.mockReturnValue('test-namespace');
    mockGetPlanVirtualMachines.mockReturnValue([]);
    mockUseK8sWatchResource.mockReturnValue([{ data: {} }, true, null]);
  });

  it('handles missing secret data gracefully', () => {
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockUseK8sWatchResource.mockReturnValue([{ data: null }, true, null]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(screen.getByTestId('luks-modal-body')).toBeInTheDocument();
    expect(screen.getByTestId('luks-passphrase-input-list')).toHaveTextContent('Passphrases:');
  });

  it('disables Save while secret watch is loading, then enables when loaded', () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);
    mockUseK8sWatchResource.mockReturnValue([{}, false, null]);

    const { rerender } = render(
      <EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />,
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByTestId('edit-luks-secret-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('luks-passphrase-input-list')).not.toBeInTheDocument();

    mockUseK8sWatchResource.mockReturnValue([{ data: {} }, true, null]);
    rerender(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    expect(screen.queryByTestId('edit-luks-secret-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('luks-passphrase-input-list')).toBeInTheDocument();
  });

  it('shows decoded passphrases after the secret watch resolves', async () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);
    mockUseK8sWatchResource.mockReturnValue([{}, false, null]);

    const { rerender } = render(
      <EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />,
    );

    expect(screen.queryByTestId('luks-passphrase-input-list')).not.toBeInTheDocument();

    mockUseK8sWatchResource.mockReturnValue([{ data: { 0: btoa('asdasd') } }, true, null]);
    rerender(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(await screen.findByText('Passphrases: asdasd')).toBeInTheDocument();
  });

  it('disables Save and shows error when secret watch fails', () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);
    mockUseK8sWatchResource.mockReturnValue([{}, true, new Error('Forbidden')]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByTestId('edit-luks-secret-load-error')).toBeInTheDocument();
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
  });
});
