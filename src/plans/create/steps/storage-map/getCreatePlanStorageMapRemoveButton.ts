import type { StorageMapping } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import { isSoleMappingOfUsedSource } from './utils';

type CreatePlanStorageMapRemoveButtonArgs = {
  isIscsi?: boolean;
  remove: (index: number) => void;
  storageMappingFieldsLength: number;
  storageMappings: StorageMapping[] | undefined;
  t: (key: string) => string;
  usedSourceStorages: MappingValue[];
};

export const getCreatePlanStorageMapRemoveButton = ({
  isIscsi,
  remove,
  storageMappingFieldsLength,
  storageMappings,
  t,
  usedSourceStorages,
}: CreatePlanStorageMapRemoveButtonArgs) => ({
  isDisabled: (index: number): boolean => {
    if (Boolean(isIscsi) || storageMappingFieldsLength <= 1) {
      return true;
    }

    return isSoleMappingOfUsedSource(index, storageMappings ?? [], usedSourceStorages);
  },
  onClick: (index: number): void => {
    if (
      storageMappingFieldsLength > 1 &&
      !isSoleMappingOfUsedSource(index, storageMappings ?? [], usedSourceStorages)
    ) {
      remove(index);
    }
  },
  tooltip: (index: number): string | undefined => {
    if (storageMappingFieldsLength <= 1) {
      return t('At least one storage mapping must be provided.');
    }

    if (isSoleMappingOfUsedSource(index, storageMappings ?? [], usedSourceStorages)) {
      return t('Cannot remove the only mapping for a storage used by the selected VMs.');
    }

    return undefined;
  },
});
