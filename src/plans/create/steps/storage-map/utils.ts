import type { StorageMapping } from 'src/storageMaps/utils/types';

import { t } from '@utils/i18n';

import type { MappingValue } from '../../types';

import { CreatePlanStorageMapFieldId } from './constants';

/**
 * Validates storage mappings by ensuring all storage devices detected on source VMs
 * have corresponding mappings in the provided values
 *
 * @param values - Array of storage mappings configured by user
 * @param usedSourceStorages - Array of storage devices that need to be mapped
 * @returns Error message string if any storage is unmapped, undefined if all are mapped
 */
export const validatePlanStorageMaps = (
  values: StorageMapping[],
  usedSourceStorages: MappingValue[],
  isOpenshift = false,
) => {
  if (
    // TODO: once backend will support fetching the used source storages by VMs for OCP, we will remove this check for ocp. For now, we add all source storages for ocp mappings, so validation is skipped
    !isOpenshift &&
    !usedSourceStorages.every((usedStorage) =>
      values.find(
        (value) => value[CreatePlanStorageMapFieldId.SourceStorage].id === usedStorage.id,
      ),
    )
  ) {
    return t('All storages detected on the selected VMs require a mapping.');
  }

  return undefined;
};
