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
  isDefaultVirt: boolean;
  isNetAppShift?: boolean;
  provisioner?: string;
};

export enum StorageClassAnnotation {
  IsDefault = 'storageclass.kubernetes.io/is-default-class',
  IsDefaultVirtClass = 'storageclass.kubevirt.io/is-default-virt-class',
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

export type AccessMode = 'ReadWriteOnce' | 'ReadWriteMany' | 'ReadOnlyMany';

export const ACCESS_MODE = {
  ReadOnlyMany: 'ReadOnlyMany',
  ReadWriteMany: 'ReadWriteMany',
  ReadWriteOnce: 'ReadWriteOnce',
} as const satisfies Record<string, AccessMode>;

export enum StorageMapFieldId {
  MapName = 'mapName',
  Project = 'project',
  StorageMap = 'storageMap',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  SourceStorage = 'sourceStorage',
  TargetStorage = 'targetStorage',
  AccessMode = 'accessMode',
  OffloadPlugin = 'offloadPlugin',
  StorageSecret = 'storageSecret',
  StorageProduct = 'storageProduct',
}

export type StorageMapping = {
  [StorageMapFieldId.SourceStorage]: StorageMappingValue;
  [StorageMapFieldId.TargetStorage]: StorageMappingValue;
  [StorageMapFieldId.AccessMode]?: AccessMode;
  [StorageMapFieldId.OffloadPlugin]?: string;
  [StorageMapFieldId.StorageSecret]?: string;
  [StorageMapFieldId.StorageProduct]?: string;
};
