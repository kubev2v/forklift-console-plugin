import {
  type OffloadPlugin,
  offloadPluginLabels,
  type StorageVendorProduct,
  storageVendorProductLabels,
} from '../constants';

/**
 * Gets plugin label, falling back to the raw value if no mapping exists
 */
export const getPluginLabel = (plugin: string): string =>
  offloadPluginLabels[plugin as OffloadPlugin] || plugin;

/**
 * Gets storage vendor product label, falling back to the raw value if no mapping exists
 */
export const getVendorProductLabel = (product: string): string =>
  storageVendorProductLabels[product as StorageVendorProduct] || product;
