import { CSI_VOLUME_IMPORT_VENDOR_PRODUCTS, storageVendorProducts } from './constants';
import { OffloadPlugin } from './types';

/**
 * Returns the write-path allowlist of storage vendor products for an offload plugin.
 * Shared by UI fallbacks, validation, and createOffloadPluginConfig so lists cannot drift.
 */
export const getAllowedVendorProducts = (offloadPlugin?: OffloadPlugin | ''): string[] => {
  if (offloadPlugin === OffloadPlugin.CsiVolumeImport) {
    return [...CSI_VOLUME_IMPORT_VENDOR_PRODUCTS];
  }

  return [...storageVendorProducts];
};

export const isVendorProductAllowedForPlugin = (
  offloadPlugin: OffloadPlugin | '' | undefined,
  storageProduct: string | undefined,
): boolean => {
  if (!offloadPlugin || !storageProduct) {
    return false;
  }

  return getAllowedVendorProducts(offloadPlugin).includes(storageProduct);
};
