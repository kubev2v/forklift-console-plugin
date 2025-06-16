import { CreateStorageMapFieldId, OffloadPlugin, type StorageMapping } from '../fields/constants';
import type { OffloadPluginConfig } from '../types';

/**
 * Creates an offload plugin configuration object based on the mapping's offload plugin settings
 * @param mapping - The storage mapping containing offload plugin configuration
 * @returns The offload plugin configuration object or undefined if not configured
 */
export const createOffloadPluginConfig = (
  mapping: StorageMapping,
): OffloadPluginConfig | undefined => {
  // Extract values from mapping using constants for better readability
  const offloadPlugin = mapping[CreateStorageMapFieldId.OffloadPlugin] as OffloadPlugin;
  const storageSecret = mapping[CreateStorageMapFieldId.StorageSecret];
  const storageVendorProduct = mapping[CreateStorageMapFieldId.StorageProduct];

  // Check if all required offload plugin fields are present
  if (!offloadPlugin || !storageSecret || !storageVendorProduct) {
    return undefined;
  }

  switch (offloadPlugin) {
    case OffloadPlugin.VSphereXcopyConfig:
      return {
        vsphereXcopyConfig: {
          secretRef: {
            name: storageSecret,
          },
          storageVendorProduct,
        },
      };
    default:
      return undefined;
  }
};
