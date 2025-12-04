import type { ProvidersPermissionStatus } from 'src/modules/Providers/utils/types/ProvidersPermissionStatus';

import type { OVirtVM } from '@kubev2v/types';
import type { V1beta1StorageMap } from '@kubev2v/types';

export type StorageMapData = {
  obj?: V1beta1StorageMap;
  permissions?: ProvidersPermissionStatus;
};

export type TargetStorage = {
  id: string;
  name: string;
  isDefault: boolean;
};

export enum StorageClassAnnotation {
  IsDefault = 'storageclass.kubernetes.io/is-default-class',
}

export type StorageMappingValue = { id?: string; name: string };

export type OVirtVMWithDisks = OVirtVM & {
  disks?: {
    id: string;
    storageDomain?: string;
  }[];
};

export enum StorageMapFieldId {
  MapName = 'mapName',
  Project = 'project',
  StorageMap = 'storageMap',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  SourceStorage = 'sourceStorage',
  TargetStorage = 'targetStorage',
  OffloadPlugin = 'offloadPlugin',
  StorageSecret = 'storageSecret',
  StorageProduct = 'storageProduct',
}

export type StorageMapping = {
  [StorageMapFieldId.SourceStorage]: StorageMappingValue;
  [StorageMapFieldId.TargetStorage]: StorageMappingValue;
  [StorageMapFieldId.OffloadPlugin]?: string;
  [StorageMapFieldId.StorageSecret]?: string;
  [StorageMapFieldId.StorageProduct]?: string;
};

export enum OffloadPlugin {
  VSphereXcopyConfig = 'vsphereXcopyConfig',
}

// Reference: https://github.com/kubev2v/forklift/blob/29b60e21c388420e6e0e79a55802c2c0a201ab45/pkg/apis/forklift/v1beta1/mapping.go
export enum StorageVendorProduct {
  FlashSystem = 'flashSystem',
  Vantara = 'vantara',
  Ontap = 'ontap',
  Primera3Par = 'primera3par',
  PowerFlex = 'powerflex',
  PowerMax = 'powermax',
  PowerStore = 'powerstore',
  PureFlashArray = 'pureFlashArray',
  Infinibox = 'infinibox',
}
