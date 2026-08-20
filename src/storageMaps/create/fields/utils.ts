import { validateOffloadFields } from 'src/storageMaps/utils/validateOffloadFields';

import { t } from '@utils/i18n';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

/**
 * Validates storage mapping configurations to ensure complete and valid mappings
 * @param values - Array of storage mappings to validate
 * @returns Translated validation error string or undefined if valid
 */
export const validateStorageMaps = (values: StorageMapping[]): string | undefined => {
  if (!Array.isArray(values)) {
    return t('Invalid mappings');
  }

  let emptyCount = 0;
  let validCount = 0;
  let incompleteCount = 0;

  // Count empty, valid, and incomplete rows
  for (const value of values) {
    const hasSource = Boolean(value[StorageMapFieldId.SourceStorage]?.name);
    const hasTarget = Boolean(value[StorageMapFieldId.TargetStorage]?.name);

    if (!hasSource && !hasTarget) {
      emptyCount += 1;
    } else if (hasSource && hasTarget) {
      validCount += 1;
    } else {
      // Incomplete row: either source or target is missing
      incompleteCount += 1;
    }
  }

  if (values.length === 1 && emptyCount === 1) {
    return t('You must select a source and target storage');
  }

  if (emptyCount > 0 || incompleteCount > 0) {
    return t('Each row must have both source and target storage selected');
  }

  if (validCount === 0) {
    return t('At least one row must have both source and target storages');
  }

  for (const value of values) {
    const offloadError = validateOffloadFields(value);
    if (offloadError) {
      return offloadError;
    }
  }

  return undefined;
};
