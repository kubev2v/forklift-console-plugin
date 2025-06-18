import type { V1beta1StorageMapSpecMap } from '@kubev2v/types';

type OffloadPlugin = {
  vsphereXcopyConfig?: {
    secretRef?: string;
    storageVendorProduct?: string;
  };
};

// Extended storage map spec that includes the offloadPlugin
export type V1beta1StorageMapSpecMapWithOffload = {
  offloadPlugin?: OffloadPlugin;
} & V1beta1StorageMapSpecMap;
