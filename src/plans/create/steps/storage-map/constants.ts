import { StorageMapFieldId, storageMapFieldLabels } from 'src/storageMaps/constants';

import { t } from '@utils/i18n';

export const CreatePlanStorageMapFieldId = {
  ...StorageMapFieldId,
  ExistingStorageMap: 'existingStorageMap',
  StorageMapName: 'storageMapName',
  StorageMapType: 'storageMapType',
} as const;

export const createPlanStorageMapFieldLabels = {
  ...storageMapFieldLabels,
  [CreatePlanStorageMapFieldId.ExistingStorageMap]: t('Storage map'),
  [CreatePlanStorageMapFieldId.StorageMapName]: t('Storage map name'),
  [CreatePlanStorageMapFieldId.StorageMapType]: t('Storage map type'),
} as const;

export enum StorageMapType {
  New = 'new',
  Existing = 'existing',
}

export const storageMapTypeLabels = {
  [StorageMapType.Existing]: t('Use an existing storage map'),
  [StorageMapType.New]: t('Use new storage map'),
} as const;
