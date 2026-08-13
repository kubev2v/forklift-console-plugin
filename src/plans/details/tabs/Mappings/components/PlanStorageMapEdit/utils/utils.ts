import { transformFormValuesToK8sSpec } from 'src/storageMaps/details/utils/utils';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { StorageMapModel, type V1beta1Provider, type V1beta1StorageMap } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import type { PlanStorageEditFormValues } from './types';

/**
 * True when this row is the only mapping that covers a used (VM-detected) source storage.
 * Duplicate rows for the same used source may be removed while coverage remains (MTV-6324).
 */
export const isSoleMappingOfUsedSource = (
  index: number,
  storageMappings: StorageMapping[],
  usedSourceStorages: MappingValue[],
): boolean => {
  const sourceId = storageMappings[index]?.[StorageMapFieldId.SourceStorage]?.id;
  if (!sourceId) {
    return false;
  }

  const isUsedSource = usedSourceStorages.some((storage) => storage.id === sourceId);
  if (!isUsedSource) {
    return false;
  }

  const mappingsOfSource = storageMappings.filter(
    (mapping) => mapping[StorageMapFieldId.SourceStorage]?.id === sourceId,
  );

  return mappingsOfSource.length <= 1;
};

export const patchStorageMappingValues = async (
  formValues: PlanStorageEditFormValues,
  storageMap: V1beta1StorageMap,
  sourceProvider: V1beta1Provider,
): Promise<void> => {
  const filteredStorageMap = formValues.storageMap?.filter((mapping) => {
    const hasSource = Boolean(mapping[StorageMapFieldId.SourceStorage]?.name);
    const hasTarget = Boolean(mapping[StorageMapFieldId.TargetStorage]?.name);

    return hasSource || hasTarget;
  });

  const updatedStorageMap = transformFormValuesToK8sSpec(
    { storageMap: filteredStorageMap },
    storageMap,
    sourceProvider?.spec?.type === PROVIDER_TYPES.openshift,
  );

  if (updatedStorageMap) {
    await k8sPatch({
      data: [
        {
          op: isEmpty(storageMap?.spec?.map) ? ADD : REPLACE,
          path: '/spec/map',
          value: updatedStorageMap.spec?.map ?? [],
        },
      ],
      model: StorageMapModel,
      resource: storageMap,
    });
  }
};
