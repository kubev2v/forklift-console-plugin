import { t } from '@utils/i18n';

import type { MappingValue } from '../../types';

export enum StorageMapFieldId {
  StorageMap = 'storageMap',
  SourceStorage = 'sourceStorage',
  TargetStorage = 'targetStorage',
}

export const storageMapFieldLabels: Partial<Record<StorageMapFieldId, ReturnType<typeof t>>> = {
  [StorageMapFieldId.SourceStorage]: t('Source Storage'),
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
