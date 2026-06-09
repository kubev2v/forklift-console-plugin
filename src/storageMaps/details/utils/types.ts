import type { V1beta1StorageMapSpecMap } from '@forklift-ui/types';
import type { StorageMapping } from '@utils/storage/types';

/**
 * Extended storage map spec with a more flexible offload plugin configuration
 * that allows string values for storageVendorProduct instead of restrictive enum
 */
export type CustomV1beta1StorageMapSpecMap = Omit<V1beta1StorageMapSpecMap, 'offloadPlugin'> & {
  offloadPlugin?: {
    vsphereXcopyConfig?: {
      secretRef?: string;
      storageVendorProduct?: string;
    };
  };
};

export type UpdateMappingsFormData = {
  storageMap: StorageMapping[];
};
