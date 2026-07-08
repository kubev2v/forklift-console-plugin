import { StorageMapFieldId } from '@utils/storage/types';

import { CreatePlanStorageMapFieldId } from '../../storage-map/constants';

export const REVIEW_TABLE_HEADER_WIDTH = 30;
export const REVIEW_TABLE_EXPANDABLE_HEADER_WIDTH = 25;

export const STORAGE_REVIEW_TABLE_HEADER_KEYS = [
  CreatePlanStorageMapFieldId.SourceStorage,
  CreatePlanStorageMapFieldId.TargetStorage,
  StorageMapFieldId.AccessMode,
];
