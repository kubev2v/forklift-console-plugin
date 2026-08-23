import type { FieldArrayWithId, UseFieldArrayRemove } from 'react-hook-form';
import type { TFunction } from 'i18next';
import { isSoleMappingOfUsedSource } from 'src/plans/create/steps/storage-map/utils';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';

import { StorageMapFieldId } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import type { PlanStorageEditFormValues } from '../utils/types';

type GetPlanStorageMapRemoveButtonArgs = {
  isIscsi?: boolean;
  remove: UseFieldArrayRemove;
  storageMappingFields: FieldArrayWithId<PlanStorageEditFormValues, 'storageMap'>[];
  storageMappings: PlanStorageEditFormValues['storageMap'] | undefined;
  t: TFunction;
  usedSourceStorages: MappingValue[];
};

type PlanStorageMapRemoveButton = {
  isDisabled: (index: number) => boolean;
  onClick: (index: number) => void;
  tooltip: (index: number) => string | undefined;
};

export const getPlanStorageMapRemoveButton = ({
  isIscsi,
  remove,
  storageMappingFields,
  storageMappings,
  t,
  usedSourceStorages,
}: GetPlanStorageMapRemoveButtonArgs): PlanStorageMapRemoveButton => ({
  isDisabled: (index: number): boolean => {
    if (Boolean(isIscsi) || storageMappingFields.length <= 1) {
      return true;
    }

    return isSoleMappingOfUsedSource(index, storageMappings ?? [], usedSourceStorages);
  },
  onClick: (index: number): void => {
    if (
      storageMappingFields.length > 1 &&
      !isSoleMappingOfUsedSource(index, storageMappings ?? [], usedSourceStorages)
    ) {
      remove(index);
    }
  },
  tooltip: (index: number): string | undefined => {
    if (storageMappingFields.length <= 1) {
      return t('At least one storage mapping must be provided.');
    }

    if (isSoleMappingOfUsedSource(index, storageMappings ?? [], usedSourceStorages)) {
      return t('Cannot remove the only mapping for a storage used by the selected VMs.');
    }

    return undefined;
  },
});

export const getMissingUsedSourceStorage = (
  storageMappings: PlanStorageEditFormValues['storageMap'] | undefined,
  usedSourceStorages: MappingValue[],
): MappingValue | undefined =>
  usedSourceStorages.find(
    (sourceStorage) =>
      !storageMappings?.some(
        (storageMapping) =>
          storageMapping[StorageMapFieldId.SourceStorage]?.id === sourceStorage.id,
      ),
  );

type DefaultAppendMapping = {
  [StorageMapFieldId.SourceStorage]: MappingValue;
  [StorageMapFieldId.TargetStorage]: { name: string };
};

export const getDefaultAppendMapping = (
  missingStorage: MappingValue | undefined,
  targetStorageName: string,
): DefaultAppendMapping => ({
  [StorageMapFieldId.SourceStorage]:
    missingStorage ?? defaultStorageMapping[StorageMapFieldId.SourceStorage],
  [StorageMapFieldId.TargetStorage]: {
    name: targetStorageName || defaultStorageMapping[StorageMapFieldId.TargetStorage].name,
  },
});
