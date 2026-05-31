import type { OVirtVM, V1beta1StorageMap } from '@forklift-ui/types';
import type { MappingValue, PermissionStatus } from '@utils/types';

export type StorageMapData = {
  obj?: V1beta1StorageMap;
  permissions?: PermissionStatus;
};

export type TargetStorage = {
  id: string;
  name: string;
  isDefault: boolean;
  isNetAppShift?: boolean;
  provisioner?: string;
};

export enum StorageClassAnnotation {
  IsDefault = 'storageclass.kubernetes.io/is-default-class',
  NetAppShiftStorageClassType = 'shift.netapp.io/storage-class-type',
}

/** @deprecated Use MappingValue from @utils/types instead */
export type StorageMappingValue = MappingValue;

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
