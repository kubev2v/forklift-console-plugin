import type { OVirtVM } from '@kubev2v/types';

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
