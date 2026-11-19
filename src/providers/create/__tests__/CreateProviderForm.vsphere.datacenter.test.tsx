import type { ReactElement } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import type { CreateProviderPlacement } from '../hooks/createProviderPlacement.types';

import {
  clearAllProviderMocks,
  mockCreateProvider,
  mockCreateProviderSecret,
  mockK8sPatch,
  mockNavigate,
} from './test-utils';
import {
  APPLIANCE_INTRO,
  buildPlacement,
  openVsphereForm,
  startApplianceStep,
  submitProvider,
} from './vsphere-datacenter-test-utils';

jest.mock('../fields/ProviderTypeField', () => {
  const { mockCreateProviderTypeField } = jest.requireActual('./test-utils');
  return mockCreateProviderTypeField('vsphere', 'VMware vSphere');
});
jest.mock('@utils/hooks/useFeatureFlags', () => ({
  useFeatureFlags: (): { isFeatureEnabled: () => boolean } => ({ isFeatureEnabled: () => true }),
}));

let mockDatacenterInventory: {
  error: Error | null;
  inventory: { name: string }[] | null;
  loading: boolean;
};
jest.mock('@utils/hooks/useProviderInventory', () => ({
  __esModule: true,
  default: (): unknown => mockDatacenterInventory,
}));
jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/CopyAppliancePlacementForm',
  () => ({
    __esModule: true,
    default: (): ReactElement => <div data-testid="placement-form" />,
  }),
);
jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementLabels',
  () => ({
    useCopyAppliancePlacementLabels: (): Record<
      string,
      { help: string; label: string; placeholder: string }
    > => ({
      datastore: { help: '', label: 'Datastore', placeholder: '' },
      folder: { help: '', label: 'Folder', placeholder: '' },
      network: { help: '', label: 'Network', placeholder: '' },
      resourcePool: { help: '', label: 'Resource pool', placeholder: '' },
    }),
  }),
);

let mockPlacement: CreateProviderPlacement;
jest.mock('../hooks/useCreateProviderPlacement', () => ({
  useCreateProviderPlacement: (): CreateProviderPlacement => mockPlacement,
}));

describe('CreateProviderForm - vSphere datacenter step', () => {
  beforeEach(() => {
    clearAllProviderMocks();
    mockDatacenterInventory = {
      error: null,
      inventory: [{ name: 'DC2' }, { name: 'DC1' }, { name: ' DC1 ' }],
      loading: false,
    };
    mockPlacement = buildPlacement();
    mockCreateProviderSecret.mockResolvedValue({
      metadata: { name: 'source-secret', namespace: 'test-namespace' },
    });
    mockCreateProvider.mockImplementation((provider: V1beta1Provider) =>
      Promise.resolve({ ...provider, metadata: { ...provider.metadata, uid: 'provider-uid' } }),
    );
  });

  it('renders the appliance datacenter select, intro line, and placement fields as one block', async () => {
    const user = userEvent.setup();
    await startApplianceStep(user);

    expect(await screen.findByText(APPLIANCE_INTRO)).toBeInTheDocument();
    const select = screen.getByPlaceholderText('Select a datacenter');
    const deployButton = screen.getByTestId('provider-deploy-button');
    expect(screen.getByTestId('placement-form')).toBeInTheDocument();
    expect(deployButton).toBeDisabled();

    await user.click(select);
    expect(screen.queryByText('All datacenters')).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'DC1' }));

    await waitFor(() => {
      expect(deployButton).toBeEnabled();
    });
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          { op: 'add', path: '/spec/settings/datacenter', value: 'DC1' },
        ]),
      }),
    );
  });

  it('shows a single placement loading state while the appliance inventory loads', async () => {
    mockDatacenterInventory = { error: null, inventory: null, loading: true };
    const user = userEvent.setup();
    await startApplianceStep(user);

    expect(
      await screen.findByRole('heading', { level: 4, name: 'Loading vSphere placement inventory' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('placement-form')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Select a datacenter')).not.toBeInTheDocument();
  });

  it('lists All datacenters and finishes without placement for non-appliance providers', async () => {
    const user = userEvent.setup();
    await openVsphereForm(user);
    await user.click(screen.getByTestId('vddk-setup-skip-radio'));
    await submitProvider(user);

    const select = await screen.findByPlaceholderText('All datacenters');
    expect(screen.queryByTestId('placement-form')).not.toBeInTheDocument();
    expect(screen.queryByText(APPLIANCE_INTRO)).not.toBeInTheDocument();

    await user.click(select);
    expect(screen.getByRole('option', { name: 'All datacenters' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('source'));
    });
  });

  it('does not show a Datacenter step for ESXi providers', async () => {
    const user = userEvent.setup();
    await openVsphereForm(user, 'esxi');
    await user.click(screen.getByTestId('vddk-setup-skip-radio'));
    await submitProvider(user);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    expect(screen.queryByRole('button', { name: 'Datacenter' })).not.toBeInTheDocument();
  });
});
