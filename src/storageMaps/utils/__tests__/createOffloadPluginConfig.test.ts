import { createOffloadPluginConfig } from 'src/storageMaps/utils/createOffloadPluginConfig';
import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it } from '@jest/globals';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

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

  it('returns undefined for an unknown offload plugin', () => {
    expect(
      createOffloadPluginConfig({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: 'unknownPlugin',
        [StorageMapFieldId.StorageProduct]: 'primera3par',
        [StorageMapFieldId.StorageSecret]: 'hpe-secret',
      }),
    ).toBeUndefined();
  });

  it('returns undefined for CSI with a non-CRD-allowed vendor product', () => {
    expect(
      createOffloadPluginConfig({
        ...baseMapping,
        [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
        [StorageMapFieldId.StorageProduct]: 'ontap',
        [StorageMapFieldId.StorageSecret]: 'netapp-secret',
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

  it('creates vsphereXcopyConfig for a CRD-discovered product outside static constants', () => {
    const result = createOffloadPluginConfig({
      ...baseMapping,
      [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.VSphereXcopyConfig,
      [StorageMapFieldId.StorageProduct]: 'customVendor',
      [StorageMapFieldId.StorageSecret]: 'vendor-secret',
    });

    expect(result).toEqual({
      vsphereXcopyConfig: {
        secretRef: 'vendor-secret',
        storageVendorProduct: 'customVendor',
      },
    });
  });
});
