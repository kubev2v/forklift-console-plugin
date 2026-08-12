import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { createOffloadPluginConfig } from '../createOffloadPluginConfig';

const baseMapping: StorageMapping = {
  [StorageMapFieldId.SourceStorage]: { id: 'ds-1', name: 'datastore-1' },
  [StorageMapFieldId.TargetStorage]: { name: 'sc-1' },
};

describe('createOffloadPluginConfig', () => {
  it('returns undefined when required offload fields are missing', () => {
    expect(
      createOffloadPluginConfig({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
      }),
    ).toBeUndefined();
  });

  it('creates csiVolumeImport config without dedicated hosts', () => {
    const result = createOffloadPluginConfig({
      ...baseMapping,
      [StorageMapFieldId.DedicatedMigrationHosts]: ['esxi-1'],
      [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
      [StorageMapFieldId.StorageProduct]: 'primera3par',
      [StorageMapFieldId.StorageSecret]: 'hpe-secret',
    });

    expect(result).toEqual({
      csiVolumeImport: {
        secretRef: 'hpe-secret',
        storageVendorProduct: 'primera3par',
      },
    });
    expect(result).not.toHaveProperty('vsphereXcopyConfig');
  });

  it('creates vsphereXcopyConfig including dedicated hosts when present', () => {
    const result = createOffloadPluginConfig({
      ...baseMapping,
      [StorageMapFieldId.DedicatedMigrationHosts]: ['esxi-1'],
      [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
      [StorageMapFieldId.StorageProduct]: 'ontap',
      [StorageMapFieldId.StorageSecret]: 'netapp-secret',
    });

    expect(result).toEqual({
      vsphereXcopyConfig: {
        dedicatedMigrationHosts: ['esxi-1'],
        secretRef: 'netapp-secret',
        storageVendorProduct: 'ontap',
      },
    });
  });
});
