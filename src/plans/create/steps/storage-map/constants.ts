import { t } from '@utils/i18n';

import type { MappingValue } from '../../types';

export enum StorageMapFieldId {
  StorageMap = 'storageMap',
  ExistingStorageMap = 'existingStorageMap',
  StorageMapType = 'storageMapType',
  StorageMapName = 'storageMapName',
  SourceStorage = 'sourceStorage',
  TargetStorage = 'targetStorage',
}

export const storageMapFieldLabels: Partial<Record<StorageMapFieldId, ReturnType<typeof t>>> = {
  [StorageMapFieldId.ExistingStorageMap]: t('Storage map'),
  [StorageMapFieldId.SourceStorage]: t('Source Storage'),
  [StorageMapFieldId.StorageMapName]: t('Storage map name'),
  [StorageMapFieldId.TargetStorage]: t('Target Storage'),
};

export type StorageMapping = {
  [StorageMapFieldId.SourceStorage]: MappingValue;
  [StorageMapFieldId.TargetStorage]: MappingValue;
};

export const defaultStorageMapping: StorageMapping = {
  [StorageMapFieldId.SourceStorage]: { name: '' },
  [StorageMapFieldId.TargetStorage]: { name: '' },
};

export type TargetStorage = {
  id: string;
  name: string;
  isDefault: boolean;
};

export enum StorageClassAnnotation {
  IsDefault = 'storageclass.kubernetes.io/is-default-class',
}

export enum StorageMapType {
  New = 'new',
  Existing = 'existing',
}

export const storageMapTypeLabels = {
  [StorageMapType.Existing]: t('Use an existing storage map'),
  [StorageMapType.New]: t('Use new storage map'),
};
