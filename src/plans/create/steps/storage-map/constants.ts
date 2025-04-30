import { t } from '@utils/i18n';

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
  [StorageMapFieldId.SourceStorage]: string;
  [StorageMapFieldId.TargetStorage]: string;
};

export const defaultStorageMapping: StorageMapping = {
  [StorageMapFieldId.SourceStorage]: '',
  [StorageMapFieldId.TargetStorage]: '',
};

export type TargetStorage = {
  id: string;
  name: string;
  isDefault: boolean;
};

export enum StorageClassAnnotation {
  IsDefault = 'storageclass.kubernetes.io/is-default-class',
}
