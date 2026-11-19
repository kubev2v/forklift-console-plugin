import type { V1beta1Provider } from '@forklift-ui/types';
import { render, screen, waitFor } from '@testing-library/react';
import type { userEvent } from '@testing-library/user-event';
import { ProviderStatus } from '@utils/types';

import CreateProviderForm from '../CreateProviderForm';
import type { CreateProviderPlacement } from '../hooks/createProviderPlacement.types';

export const APPLIANCE_INTRO =
  'Select placement for the sourcing appliance template. Datacenter, datastore, folder, network, and resource pool are required.';

const PLACEMENT_OPTIONS = {
  datastoreOptions: [{ children: 'datastore-1', itemId: 'datastore-1' }],
  datastoreWarning: (): string | undefined => undefined,
  folderOptions: [{ children: 'folder-1', itemId: 'folder-1' }],
  inventoryError: null,
  inventoryErrors: {},
  inventoryLoading: false,
  networkOptions: [{ children: 'network-1', itemId: 'network-1' }],
  onRetry: jest.fn(),
  resourcePoolOptions: [{ children: 'pool-1', itemId: 'pool-1' }],
} as CreateProviderPlacement['options'];

const readyProvider = (): V1beta1Provider =>
  ({
    metadata: { name: 'source', namespace: 'test-namespace', uid: 'provider-uid' },
    spec: { settings: { sdkEndpoint: 'vcenter' }, type: 'vsphere' },
    status: { phase: ProviderStatus.Ready },
  }) as unknown as V1beta1Provider;

export const buildPlacement = (inventoryLoading = false): CreateProviderPlacement => ({
  canDeploy: true,
  connection: {
    error: null,
    isMissing: false,
    isReady: true,
    loaded: true,
    phase: ProviderStatus.Ready,
    provider: readyProvider(),
  },
  onChange: jest.fn(),
  options: { ...PLACEMENT_OPTIONS, inventoryLoading },
  values: { datastore: '', folder: '', network: '', resourcePool: '' },
});

export const openVsphereForm = async (
  user: ReturnType<typeof userEvent.setup>,
  endpoint: 'vcenter' | 'esxi' = 'vcenter',
): Promise<void> => {
  render(<CreateProviderForm />);
  await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');
  if (endpoint === 'esxi') {
    await user.click(screen.getByTestId('vsphere-endpoint-esxi-radio'));
  }
  await user.type(screen.getByTestId('provider-name-input'), 'source');
  await user.type(screen.getByTestId('vsphere-url-input'), 'https://vsphere.example.com/sdk');
  await user.type(await screen.findByTestId('vsphere-username-input'), 'admin');
  await user.type(screen.getByTestId('vsphere-password-input'), 'secret');
  await user.click(screen.getByTestId('certificate-validation-skip'));
  await user.click(await screen.findByTestId('confirm-skip-certificate-validation'));
};

export const submitProvider = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
  const createButton = screen.getByTestId('provider-create-button');
  await waitFor(() => {
    expect(createButton).toBeEnabled();
  });
  await user.click(createButton);
};

export const startApplianceStep = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  await openVsphereForm(user);
  await user.click(screen.getByTestId('disk-transfer-method-toggle'));
  await user.click(screen.getByRole('option', { name: 'Use a sourcing appliance' }));
  await submitProvider(user);
};
