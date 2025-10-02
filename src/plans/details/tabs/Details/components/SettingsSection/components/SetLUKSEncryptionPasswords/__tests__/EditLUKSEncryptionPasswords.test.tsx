import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { beforeEach, describe, expect, it } from '@jest/globals';
import type { V1beta1Plan } from '@kubev2v/types';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import EditLUKSEncryptionPasswords from '../EditLUKSEncryptionPasswords';

const mockOnDiskDecryptionConfirm = jest.fn().mockResolvedValue(undefined);
jest.mock('../utils/utils', () => ({
  onDiskDecryptionConfirm: jest.fn((...args) => mockOnDiskDecryptionConfirm(...args)),
}));

const mockGetLUKSSecretName = jest.fn();
const mockGetPlanVirtualMachines = jest.fn();
jest.mock('@utils/crds/plans/selectors', () => ({
  getLUKSSecretName: jest.fn((...args) => mockGetLUKSSecretName(...args)),
  getPlanVirtualMachines: jest.fn((...args) => mockGetPlanVirtualMachines(...args)),
}));

const mockGetNamespace = jest.fn();
jest.mock('@utils/crds/common/selectors', () => ({
  getNamespace: jest.fn((...args) => mockGetNamespace(...args)),
}));

const mockUseK8sWatchResource = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(),
  useK8sWatchResource: jest.fn((...args) => mockUseK8sWatchResource(...args)),
}));

jest.mock(
  '../components/EditLUKSModalAlert',
  () =>
    ({ shouldRender }: { shouldRender: any }) =>
      shouldRender ? <div data-testid="luks-modal-alert" /> : null,
);
jest.mock('../components/EditLUKSModalBody', () => () => <div data-testid="luks-modal-body" />);
jest.mock(
  '../LUKSPassphraseInputList',
  () =>
    ({ value, onChange }: { value: any; onChange: any }) => (
      <div data-testid="luks-passphrase-input-list">
        <div>Passphrases: {value.join(', ')}</div>
        <button data-testid="add-passphrase" onClick={() => onChange([...value, 'new-passphrase'])}>
          Add
        </button>
      </div>
    ),
);

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-namespace' },
  spec: { vms: [] },
} as unknown as V1beta1Plan;

const renderWithModal = (component: React.ReactElement) => render(<ModalHOC>{component}</ModalHOC>);

describe('EditLUKSEncryptionPasswords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockGetNamespace.mockReturnValue('test-namespace');
    mockGetPlanVirtualMachines.mockReturnValue([]);
    mockUseK8sWatchResource.mockReturnValue([{ data: {} }, false, null]);
  });

  it('initializes NBDE state from VM data', () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: true }]);

    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    expect(checkbox).toBeChecked();
  });

  it('toggles NBDE checkbox', async () => {
    const user = userEvent.setup();
    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('shows passphrase fields when NBDE is disabled', () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);

    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    expect(screen.getByText('Passphrases for LUKS encrypted devices')).toBeInTheDocument();
    expect(screen.getByTestId('luks-passphrase-input-list')).toBeInTheDocument();
  });

  it('hides passphrase fields when NBDE is enabled', async () => {
    const user = userEvent.setup();
    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);

    expect(screen.queryByText('Passphrases for LUKS encrypted devices')).not.toBeInTheDocument();
  });

  it('loads existing passphrases from secret', async () => {
    mockGetPlanVirtualMachines.mockReturnValue([{ nbdeClevis: false }]);
    mockUseK8sWatchResource.mockReturnValue([
      { data: { pass1: btoa('test-pass-1'), pass2: btoa('test-pass-2') } },
      false,
      null,
    ]);

    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByText('Passphrases: test-pass-1, test-pass-2')).toBeInTheDocument();
    });
  });

  it('clears passphrases when NBDE is enabled', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([{ data: { pass1: btoa('test-pass') } }, false, null]);

    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByText('Passphrases: test-pass')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);
    await user.click(checkbox); // Disable to see cleared state

    expect(screen.getByText(/Passphrases:/)).toBeInTheDocument();
  });

  it('submits form with correct NBDE state', async () => {
    const user = userEvent.setup();
    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);

    const confirmButton = screen.getByRole('button', { name: /save/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDiskDecryptionConfirm).toHaveBeenCalledWith({
        nbdeClevis: true,
        newValue: JSON.stringify([]),
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

    renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    expect(screen.getByTestId('luks-modal-alert')).toBeInTheDocument();
  });

  it('handles missing secret data gracefully', () => {
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockUseK8sWatchResource.mockReturnValue([{ data: null }, false, null]);

    const { container } = renderWithModal(<EditLUKSEncryptionPasswords resource={mockPlan} />);

    expect(container.firstChild).toBeNull();
  });
});
