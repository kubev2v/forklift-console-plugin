import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

const mockK8sPatch = jest.fn().mockResolvedValue({});
const mockUseProviderInventory = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));
jest.mock('@utils/hooks/useProviderInventory', () => ({
  __esModule: true,
  default: (...args: unknown[]): unknown => mockUseProviderInventory(...args),
}));

import EditVsphereDatacenterModal from '../EditVsphereDatacenterModal';

const provider = (): V1beta1Provider =>
  ({
    metadata: { name: 'source', namespace: 'ns' },
    spec: {
      settings: {
        copyApplianceDatastore: 'datastore-1',
        copyApplianceFolder: '/DC1/vm/appliance',
        copyApplianceNetwork: 'network-1',
        copyApplianceResourcePool: '/DC1/host/pool',
        datacenter: 'DC1',
        sdkEndpoint: 'vcenter',
      },
      type: 'vsphere',
    },
  }) as unknown as V1beta1Provider;

const COPY_APPLIANCE_ANNOTATIONS = {
  [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance,
};

const sourcingApplianceProvider = (settings: Record<string, string>): V1beta1Provider =>
  ({
    metadata: { annotations: COPY_APPLIANCE_ANNOTATIONS, name: 'source', namespace: 'ns' },
    spec: { settings: { sdkEndpoint: 'vcenter', ...settings }, type: 'vsphere' },
  }) as unknown as V1beta1Provider;

const closeOverlay = jest.fn();

const renderModal = (resource: V1beta1Provider): ReturnType<typeof render> =>
  render(<EditVsphereDatacenterModal closeOverlay={closeOverlay} resource={resource} />);

const expectPatches = (patches: Record<string, unknown>[]): Promise<void> =>
  waitFor(() => {
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.arrayContaining(patches) }),
    );
  });

const typeDatacenter = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
): Promise<void> => {
  const input = screen.getByDisplayValue('DC1');
  await user.clear(input);
  await user.type(input, `${value}{Enter}`);
};

describe('EditVsphereDatacenterModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProviderInventory.mockReturnValue({
      error: null,
      forceRefresh: jest.fn(),
      inventory: [
        { id: 'dc-1', name: 'DC1' },
        { id: 'dc-2', name: 'DC2' },
        { id: 'dc-2-dup', name: 'DC2' },
      ],
      loading: false,
    });
  });

  it('requires resetting the copy appliance placement when the folder is outside the new datacenter', async () => {
    const user = userEvent.setup();
    renderModal(provider());

    await typeDatacenter(user, 'DC2');

    expect(
      await screen.findByText('Copy appliance placement is outside the selected datacenter'),
    ).toBeInTheDocument();

    const confirmButton = screen.getByTestId('modal-confirm-button');
    const resetCheckbox = screen.getByTestId('reset-copy-appliance-placement-checkbox');
    expect(resetCheckbox).toBeChecked();
    expect(confirmButton).toBeEnabled();

    await user.click(resetCheckbox);
    expect(confirmButton).toBeDisabled();

    await user.click(resetCheckbox);
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    await expectPatches([
      { op: 'replace', path: '/spec/settings/datacenter', value: 'DC2' },
      { op: 'remove', path: '/spec/settings/copyApplianceDatastore' },
      { op: 'remove', path: '/spec/settings/copyApplianceFolder' },
      { op: 'remove', path: '/spec/settings/copyApplianceNetwork' },
      { op: 'remove', path: '/spec/settings/copyApplianceResourcePool' },
    ]);
    expect(closeOverlay).toHaveBeenCalled();
  });

  it('omits "All datacenters" for sourcing appliance providers', async () => {
    const user = userEvent.setup();
    renderModal(sourcingApplianceProvider({ datacenter: 'DC1' }));

    await user.click(screen.getByDisplayValue('DC1'));

    expect(screen.queryByText('All datacenters')).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'DC2' }));
    expect(screen.getByDisplayValue('DC2')).toBeInTheDocument();

    await user.click(screen.getByTestId('modal-confirm-button'));

    await expectPatches([{ op: 'replace', path: '/spec/settings/datacenter', value: 'DC2' }]);
  });

  it('blocks saving and explains the requirement when a sourcing appliance provider has no datacenter', () => {
    renderModal(sourcingApplianceProvider({}));

    expect(
      screen.getByText('A datacenter is required when using a sourcing appliance'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('modal-confirm-button')).toBeDisabled();
  });

  it('allows clearing the datacenter for providers that do not use a sourcing appliance', async () => {
    const user = userEvent.setup();
    renderModal(provider());

    await user.click(screen.getByDisplayValue('DC1'));

    const allDatacentersOption = screen.getByRole('option', { name: 'All datacenters' });
    expect(allDatacentersOption).not.toBeDisabled();

    await user.click(allDatacentersOption);
    const confirmButton = screen.getByTestId('modal-confirm-button');
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);

    await expectPatches([{ op: 'remove', path: '/spec/settings/datacenter' }]);
  });

  it('offers retry and manual entry when the datacenter inventory fails', async () => {
    mockUseProviderInventory.mockReturnValue({
      error: new Error('inventory unavailable'),
      forceRefresh: jest.fn(),
      inventory: null,
      loading: false,
    });
    const user = userEvent.setup();
    renderModal(provider());

    expect(await screen.findByText('Could not load the datacenter list')).toBeInTheDocument();
    expect(screen.getByText('Enter the datacenter name manually.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();

    await user.click(screen.getByDisplayValue('DC1'));
    expect(screen.queryByText('Use datacenter')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All datacenters' })).toBeInTheDocument();

    await typeDatacenter(user, 'DC9');
    const confirmButton = screen.getByTestId('modal-confirm-button');
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    await expectPatches([{ op: 'replace', path: '/spec/settings/datacenter', value: 'DC9' }]);
  });
});
