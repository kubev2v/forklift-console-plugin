import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { describe, expect, it } from '@jest/globals';

import { getPluginLabel, getVendorProductLabel } from '../labelHelpers';
import { OffloadPlugin, StorageVendorProduct } from '../types';

describe('labelHelpers - labels', () => {
  it('returns mapped labels and falls back to raw values', () => {
    expect(getPluginLabel(OffloadPlugin.VSphereXcopyConfig)).toBe('vSphere XCOPY');
    expect(getPluginLabel('custom-plugin')).toBe('custom-plugin');
    expect(getVendorProductLabel(StorageVendorProduct.FlashSystem)).toBe('IBM FlashSystem');
    expect(getVendorProductLabel('unknown-product')).toBe('unknown-product');
  });
});
