import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';

import { buildDiskTransferProviderPatches } from '../buildDiskTransferProviderPatches';
import type { DiskTransferValues } from '../types';

const provider = (settings: Record<string, string>, marker?: string): V1beta1Provider =>
  ({
    metadata: {
      annotations: marker ? { [DISK_TRANSFER_METHOD_ANNOTATION]: marker } : undefined,
    },
    spec: { settings },
  }) as V1beta1Provider;

const values: DiskTransferValues = {
  aioEnabled: false,
  method: VddkSetupMode.CopyAppliance,
  placement: {
    datastore: 'datastore',
    folder: '/folder',
    network: 'network',
    resourcePool: '/pool',
  },
  vddkImage: '',
};

describe('buildDiskTransferProviderPatches', () => {
  it('sets appliance placement and marker while clearing VDDK and AIO', () => {
    const patches = buildDiskTransferProviderPatches(
      provider({ sdkEndpoint: 'esxi', useVddkAioOptimization: 'true', vddkInitImage: 'old' }),
      values,
    );

    expect(patches).toEqual(
      expect.arrayContaining([
        { op: 'add', path: '/spec/settings/copyApplianceDatastore', value: 'datastore' },
        { op: 'remove', path: '/spec/settings/useVddkAioOptimization' },
        { op: 'remove', path: '/spec/settings/vddkInitImage' },
        {
          op: 'add',
          path: '/metadata/annotations',
          value: { [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance },
        },
      ]),
    );
  });

  it('removes all appliance settings, VDDK, AIO, and marker on skip', () => {
    const current = provider(
      {
        copyApplianceDatastore: 'datastore',
        copyApplianceFolder: '/folder',
        copyApplianceNetwork: 'network',
        copyApplianceResourcePool: '/pool',
        sdkEndpoint: 'esxi',
        useVddkAioOptimization: 'true',
        vddkInitImage: 'quay.io/vddk:latest',
      },
      VddkSetupMode.CopyAppliance,
    );
    const patches = buildDiskTransferProviderPatches(current, {
      ...values,
      method: VddkSetupMode.Skip,
    });

    expect(patches.filter((patch) => patch.op === 'remove')).toHaveLength(7);
    expect(patches).toContainEqual({
      op: 'remove',
      path: '/metadata/annotations/forklift.konveyor.io~1ui-disk-transfer-method',
    });
    expect(patches).not.toContainEqual(
      expect.objectContaining({ path: '/spec/settings/sdkEndpoint' }),
    );
  });

  it('does not patch unchanged provider settings', () => {
    const current = provider(
      {
        copyApplianceDatastore: 'datastore',
        copyApplianceFolder: '/folder',
        copyApplianceNetwork: 'network',
        copyApplianceResourcePool: '/pool',
      },
      VddkSetupMode.CopyAppliance,
    );
    expect(buildDiskTransferProviderPatches(current, values)).toEqual([]);
  });

  it('adds the settings map when an older Provider has none', () => {
    const current = { metadata: { name: 'source' }, spec: {} } as V1beta1Provider;
    const patches = buildDiskTransferProviderPatches(current, values);

    expect(patches).toContainEqual({
      op: 'add',
      path: '/spec/settings',
      value: {
        copyApplianceDatastore: 'datastore',
        copyApplianceFolder: '/folder',
        copyApplianceNetwork: 'network',
        copyApplianceResourcePool: '/pool',
      },
    });
  });
});
