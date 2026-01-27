import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { transformFormValuesToK8sSpec } from 'src/storageMaps/details/utils/utils';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { StorageMapModel, type V1beta1Provider, type V1beta1StorageMap } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { PlanStorageEditFormValues } from './types';

export const patchStorageMappingValues = async (
  formValues: PlanStorageEditFormValues,
  storageMap: V1beta1StorageMap,
  sourceProvider: V1beta1Provider,
) => {
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
