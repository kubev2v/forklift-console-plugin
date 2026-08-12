import {
  getOffloadConfigFields,
  resolveOffloadPlugin,
} from 'src/storageMaps/utils/resolveOffloadPlugin';
import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it } from '@jest/globals';

describe('resolveOffloadPlugin', () => {
  it('returns CsiVolumeImport when csiVolumeImport is set', () => {
    expect(
      resolveOffloadPlugin({
        csiVolumeImport: { secretRef: 's', storageVendorProduct: 'primera3par' },
      }),
    ).toBe(OffloadPlugin.CsiVolumeImport);
  });

  it('returns VSphereXcopyConfig when vsphereXcopyConfig is set', () => {
    expect(
      resolveOffloadPlugin({
        vsphereXcopyConfig: { secretRef: 's', storageVendorProduct: 'ontap' },
      }),
    ).toBe(OffloadPlugin.VSphereXcopyConfig);
  });

  it('returns empty string when offloadPlugin is missing', () => {
    expect(resolveOffloadPlugin(undefined)).toBe('');
  });
});

describe('getOffloadConfigFields', () => {
  it('reads CSI fields and clears dedicated hosts', () => {
    expect(
      getOffloadConfigFields({
        csiVolumeImport: {
          secretRef: 'hpe-secret',
          storageVendorProduct: 'primera3par',
        },
      }),
    ).toEqual({
      dedicatedMigrationHosts: [],
      storageProduct: 'primera3par',
      storageSecret: 'hpe-secret',
    });
  });

  it('reads XCOPY fields including dedicated hosts', () => {
    expect(
      getOffloadConfigFields({
        vsphereXcopyConfig: {
          dedicatedMigrationHosts: ['esxi-1'],
          secretRef: 'netapp-secret',
          storageVendorProduct: 'ontap',
        },
      }),
    ).toEqual({
      dedicatedMigrationHosts: ['esxi-1'],
      storageProduct: 'ontap',
      storageSecret: 'netapp-secret',
    });
  });
});
