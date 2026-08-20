import { CSI_VOLUME_IMPORT_VENDOR_PRODUCTS, storageVendorProducts } from './constants';
import { OffloadPlugin } from './types';

/**
 * Returns the static fallback allowlist of storage vendor products for an offload plugin.
 * Shared by UI fallbacks so CSI/XCOPY defaults cannot drift from each other.
 */
export const getAllowedVendorProducts = (offloadPlugin?: OffloadPlugin | ''): string[] => {
  if (offloadPlugin === OffloadPlugin.CsiVolumeImport) {
    return [...CSI_VOLUME_IMPORT_VENDOR_PRODUCTS];
  }

  return [...storageVendorProducts];
};

/**
 * Whether a storage product may be persisted for the selected offload plugin.
 * CSI is gated to the shared write-path allowlist. XCOPY accepts any non-empty
 * product so CRD-discovered vendors offered by the UI are not stripped on Save.
 */
export const isVendorProductAllowedForPlugin = (
  offloadPlugin: OffloadPlugin | '' | undefined,
  storageProduct: string | undefined,
): boolean => {
  if (!offloadPlugin || !storageProduct) {
    return false;
  }

  if (offloadPlugin === OffloadPlugin.CsiVolumeImport) {
    return getAllowedVendorProducts(OffloadPlugin.CsiVolumeImport).includes(storageProduct);
  }

  if (offloadPlugin === OffloadPlugin.VSphereXcopyConfig) {
    return true;
  }

  return false;
};
