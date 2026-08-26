import { describe, expect, it } from '@jest/globals';

import { OffloadPlugin, StorageVendorProduct } from '../types';
import { getPluginLabel, getVendorProductLabel } from '../labelHelpers';

describe('labelHelpers - labels', () => {
  it('returns mapped labels and falls back to raw values', () => {
    expect(getPluginLabel(OffloadPlugin.VSphereXcopyConfig)).toMatch(/xcopy/i);
    expect(getPluginLabel('custom-plugin')).toBe('custom-plugin');
    expect(getVendorProductLabel(Object.values(StorageVendorProduct)[0])).toBeTruthy();
    expect(getVendorProductLabel('unknown-product')).toBe('unknown-product');
  });
});
