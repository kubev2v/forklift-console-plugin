import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { isEmpty } from '@utils/helpers';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

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
  const offloadPlugin = mapping[StorageMapFieldId.OffloadPlugin] as OffloadPlugin;
  const storageSecret = mapping[StorageMapFieldId.StorageSecret];
  const storageVendorProduct = mapping[StorageMapFieldId.StorageProduct];

  // Check if all required offload plugin fields are present
  if (!offloadPlugin || !storageSecret || !storageVendorProduct) {
    return undefined;
  }

  const dedicatedMigrationHosts = mapping[StorageMapFieldId.DedicatedMigrationHosts];

  switch (offloadPlugin) {
    case OffloadPlugin.VSphereXcopyConfig:
      return {
        vsphereXcopyConfig: {
          ...(!isEmpty(dedicatedMigrationHosts) && { dedicatedMigrationHosts }),
          secretRef: storageSecret,
          storageVendorProduct,
        },
      };
    default:
      return undefined;
  }
};
