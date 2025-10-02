import type { V1beta1StorageMapSpecMap } from '@kubev2v/types';

/**
 * Extended storage map spec with a more flexible offload plugin configuration
 * that allows string values for storageVendorProduct instead of restrictive enum
 */
export type CustomV1beta1StorageMapSpecMap = V1beta1StorageMapSpecMap & {
  offloadPlugin?: {
    vsphereXcopyConfig?: {
      secretRef?: string;
      storageVendorProduct?: string;
    };
  };
};
