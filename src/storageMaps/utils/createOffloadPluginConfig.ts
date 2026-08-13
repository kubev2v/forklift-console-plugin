import { isEmpty } from '@utils/helpers';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { CSI_VOLUME_IMPORT_VENDOR_PRODUCTS } from './constants';
import { OffloadPlugin, type OffloadPluginConfig } from './types';

/**
 * Creates an offload plugin configuration object based on the mapping's offload plugin settings
 * @param mapping - The storage mapping containing offload plugin configuration
 * @returns The offload plugin configuration object or undefined if not configured
 */
export const createOffloadPluginConfig = (
  mapping: StorageMapping,
): OffloadPluginConfig | undefined => {
  const offloadPlugin = mapping[StorageMapFieldId.OffloadPlugin] as OffloadPlugin;
  const storageSecret = mapping[StorageMapFieldId.StorageSecret];
  const storageVendorProduct = mapping[StorageMapFieldId.StorageProduct];

  if (!offloadPlugin || !storageSecret || !storageVendorProduct) {
    return undefined;
  }

  const dedicatedMigrationHosts = mapping[StorageMapFieldId.DedicatedMigrationHosts];

  if (offloadPlugin === OffloadPlugin.CsiVolumeImport) {
    if (!(CSI_VOLUME_IMPORT_VENDOR_PRODUCTS as readonly string[]).includes(storageVendorProduct)) {
      return undefined;
    }

    return {
      csiVolumeImport: {
        secretRef: storageSecret,
        storageVendorProduct,
      },
    };
  }

  if (offloadPlugin === OffloadPlugin.VSphereXcopyConfig) {
    return {
      vsphereXcopyConfig: {
        ...(!isEmpty(dedicatedMigrationHosts) && { dedicatedMigrationHosts }),
        secretRef: storageSecret,
        storageVendorProduct,
      },
    };
  }

  return undefined;
};
