import type { ReactElement } from 'react';
import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
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
  ...jest.requireActual('@utils/crds/common/selectors'),
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
    ({ shouldRender }: { shouldRender: any }): ReactElement | null =>
      shouldRender ? <div data-testid="luks-modal-alert" /> : null,
);
jest.mock('../components/EditLUKSModalBody', () => (): ReactElement => (
  <div data-testid="luks-modal-body" />
));
jest.mock(
  '../LUKSPassphraseInputList',
  () =>
    ({ value, onChange }: { onChange: any; value: any }): ReactElement => (
      <div data-testid="luks-passphrase-input-list">
        <div>Passphrases: {value.join(', ')}</div>
        <button data-testid="add-passphrase" onClick={() => onChange([...value, 'new-passphrase'])}>
          Add
        </button>
      </div>
    ),
);

jest.mock('@components/LUKSSecretSelect/LUKSSecretSelect', () => ({
  __esModule: true,
  default: ({
    onSelect,
    testId,
    value,
  }: {
    onSelect: (event: unknown, secret: IoK8sApiCoreV1Secret) => void;
    testId?: string;
    value: string;
  }): ReactElement => (
    <div data-testid={testId ?? 'luks-secret-select'}>
      Selected: {value || 'none'}
      <button
        data-testid="select-manual-luks-secret"
        onClick={() => {
          onSelect(undefined, {
            data: { '0': btoa('manual') },
            metadata: { name: 'manual-luks', namespace: 'test-namespace' },
            type: 'Opaque',
          });
        }}
        type="button"
      >
        Select manual
      </button>
    </div>
  ),
}));

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-namespace' },
  spec: { vms: [] },
} as unknown as V1beta1Plan;

const closeOverlay = jest.fn();

const planOwnedSecretWithSourceLabel = {
  data: { '0': btoa('copied') },
  metadata: {
    labels: { [SOURCE_SECRET_LABEL]: 'luks-source' },
    name: 'test-secret',
    namespace: 'test-namespace',
  },
  type: 'Opaque',
} as IoK8sApiCoreV1Secret;

const sourceSecret = {
  data: { '0': btoa('original') },
  metadata: { name: 'luks-source', namespace: 'test-namespace' },
  type: 'Opaque',
} as IoK8sApiCoreV1Secret;

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
      false,
      null,
    ]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    await waitFor(() => {
      expect(screen.getByText('Passphrases: test-pass-1, test-pass-2')).toBeInTheDocument();
    });
  });

  it('clears passphrases when NBDE is enabled', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([{ data: { pass1: btoa('test-pass') } }, false, null]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

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
    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    const checkbox = screen.getByLabelText('Use network-bound disk encryption (NBDE/Clevis)');
    await user.click(checkbox);

    const confirmButton = screen.getByRole('button', { name: /save/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDiskDecryptionConfirm).toHaveBeenCalledWith({
        nbdeClevis: true,
        newValue: JSON.stringify([]),
        resource: mockPlan,
        stripSourceSecretLabel: false,
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

  it('handles missing secret data gracefully', () => {
    mockGetLUKSSecretName.mockReturnValue('test-secret');
    mockUseK8sWatchResource.mockReturnValue([{ data: null }, false, null]);

    render(<EditLUKSEncryptionPasswords closeOverlay={closeOverlay} resource={mockPlan} />);

    expect(screen.getByTestId('luks-modal-body')).toBeInTheDocument();
    expect(screen.getByTestId('luks-passphrase-input-list')).toHaveTextContent('Passphrases:');
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
        return [undefined, true, { message: 'NotFound', code: 404 }];
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
