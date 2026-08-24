import type { ReactElement } from 'react';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

export const mockOnDiskDecryptionConfirm = jest.fn().mockResolvedValue(undefined);

jest.mock('../utils/utils', () => ({
  onDiskDecryptionConfirm: jest.fn((...args) => mockOnDiskDecryptionConfirm(...args)),
}));

export const mockGetLUKSSecretName = jest.fn();
export const mockGetPlanVirtualMachines = jest.fn();

jest.mock('@utils/crds/plans/selectors', () => ({
  getLUKSSecretName: jest.fn((...args) => mockGetLUKSSecretName(...args)),
  getPlanVirtualMachines: jest.fn((...args) => mockGetPlanVirtualMachines(...args)),
}));

export const mockGetNamespace = jest.fn();

jest.mock('@utils/crds/common/selectors', () => ({
  ...jest.requireActual('@utils/crds/common/selectors'),
  getNamespace: jest.fn((...args) => mockGetNamespace(...args)),
}));

export const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(),
  useK8sWatchResource: jest.fn((...args) => mockUseK8sWatchResource(...args)),
}));

jest.mock(
  '../components/EditLUKSModalAlert',
  () =>
    ({ shouldRender }: { shouldRender: boolean }): ReactElement | null =>
      shouldRender ? <div data-testid="luks-modal-alert" /> : null,
);
jest.mock('../components/EditLUKSModalBody', () => (): ReactElement => (
  <div data-testid="luks-modal-body" />
));
jest.mock(
  '../LUKSPassphraseInputList',
  () =>
    ({
      value,
      onChange,
    }: {
      onChange: (passphrases: string[]) => void;
      value: string[];
    }): ReactElement => (
      <div data-testid="luks-passphrase-input-list">
        <div>Passphrases: {value.join(', ')}</div>
        <button
          data-testid="add-passphrase"
          onClick={() => {
            onChange([...value, 'new-passphrase']);
          }}
          type="button"
        >
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
