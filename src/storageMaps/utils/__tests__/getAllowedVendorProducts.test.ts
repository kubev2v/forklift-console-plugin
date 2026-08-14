import {
  getAllowedVendorProducts,
  isVendorProductAllowedForPlugin,
} from 'src/storageMaps/utils/getAllowedVendorProducts';
import { OffloadPlugin, StorageVendorProduct } from 'src/storageMaps/utils/types';

import { describe, expect, it } from '@jest/globals';

describe('getAllowedVendorProducts', () => {
  it('returns CSI allowlist for CSI Volume Import', () => {
    expect(getAllowedVendorProducts(OffloadPlugin.CsiVolumeImport)).toEqual([
      StorageVendorProduct.Primera3Par,
    ]);
  });

  it('returns full vendor list for XCOPY and empty plugin', () => {
    expect(getAllowedVendorProducts(OffloadPlugin.VSphereXcopyConfig)).toContain(
      StorageVendorProduct.Ontap,
    );
    expect(getAllowedVendorProducts('')).toContain(StorageVendorProduct.Ontap);
    expect(getAllowedVendorProducts()).toContain(StorageVendorProduct.Primera3Par);
  });
});

describe('isVendorProductAllowedForPlugin', () => {
  it('allows primera3par for CSI and rejects ontap', () => {
    expect(
      isVendorProductAllowedForPlugin(
        OffloadPlugin.CsiVolumeImport,
        StorageVendorProduct.Primera3Par,
      ),
    ).toBe(true);
    expect(
      isVendorProductAllowedForPlugin(OffloadPlugin.CsiVolumeImport, StorageVendorProduct.Ontap),
    ).toBe(false);
  });

  it('allows ontap for XCOPY', () => {
    expect(
      isVendorProductAllowedForPlugin(OffloadPlugin.VSphereXcopyConfig, StorageVendorProduct.Ontap),
    ).toBe(true);
  });

  it('allows CRD-discovered XCOPY products beyond the static allowlist', () => {
    expect(isVendorProductAllowedForPlugin(OffloadPlugin.VSphereXcopyConfig, 'customVendor')).toBe(
      true,
    );
  });

  it('rejects CSI products outside the write-path allowlist', () => {
    expect(isVendorProductAllowedForPlugin(OffloadPlugin.CsiVolumeImport, 'customVendor')).toBe(
      false,
    );
  });
});
