import {
  getOffloadConfigFields,
  resolveOffloadPlugin,
} from 'src/storageMaps/utils/resolveOffloadPlugin';
import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it } from '@jest/globals';

describe('resolveOffloadPlugin', () => {
  it('returns CsiVolumeImport when csiVolumeImport is configured', () => {
    expect(
      resolveOffloadPlugin({
        csiVolumeImport: { secretRef: 's', storageVendorProduct: 'primera3par' },
      }),
    ).toBe(OffloadPlugin.CsiVolumeImport);
  });

  it('returns VSphereXcopyConfig when vsphereXcopyConfig is configured', () => {
    expect(
      resolveOffloadPlugin({
        vsphereXcopyConfig: { secretRef: 's', storageVendorProduct: 'ontap' },
      }),
    ).toBe(OffloadPlugin.VSphereXcopyConfig);
  });

  it('prefers CSI when both plugins are configured', () => {
    expect(
      resolveOffloadPlugin({
        csiVolumeImport: { secretRef: 'csi-secret', storageVendorProduct: 'primera3par' },
        vsphereXcopyConfig: { secretRef: 'xcopy-secret', storageVendorProduct: 'ontap' },
      }),
    ).toBe(OffloadPlugin.CsiVolumeImport);
  });

  it('ignores empty csiVolumeImport {} and falls through to XCOPY', () => {
    expect(
      resolveOffloadPlugin({
        csiVolumeImport: {},
        vsphereXcopyConfig: { secretRef: 's', storageVendorProduct: 'ontap' },
      }),
    ).toBe(OffloadPlugin.VSphereXcopyConfig);
  });

  it('returns empty string for empty plugin blocks', () => {
    expect(resolveOffloadPlugin({ csiVolumeImport: {} })).toBe('');
    expect(resolveOffloadPlugin({ vsphereXcopyConfig: {} })).toBe('');
  });

  it('returns empty string for offloadPlugin: {}', () => {
    expect(resolveOffloadPlugin({})).toBe('');
  });

  it('returns empty string when offloadPlugin is missing', () => {
    expect(resolveOffloadPlugin(undefined)).toBe('');
  });

  it('treats secretRef alone as a configured CSI block', () => {
    expect(resolveOffloadPlugin({ csiVolumeImport: { secretRef: 's' } })).toBe(
      OffloadPlugin.CsiVolumeImport,
    );
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

  it('returns empty fields when only empty plugin blocks are present', () => {
    expect(getOffloadConfigFields({ csiVolumeImport: {}, vsphereXcopyConfig: {} })).toEqual({
      dedicatedMigrationHosts: [],
      storageProduct: '',
      storageSecret: '',
    });
  });
});
