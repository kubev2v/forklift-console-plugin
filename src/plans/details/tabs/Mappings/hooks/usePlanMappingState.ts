import { useEffect, useState } from 'react';

import type {
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';

import { hasPlanMappingsChanged } from '../utils/utils';

export type UsePlanMappingsStateResult = {
  editMode: boolean;
  setEditMode: (edit: boolean) => void;
  dataChanged: boolean;
  updatedNetwork: V1beta1NetworkMapSpecMap[];
  setUpdatedNetwork: (mappings: V1beta1NetworkMapSpecMap[]) => void;
  updatedStorage: V1beta1StorageMapSpecMap[];
  setUpdatedStorage: (mappings: V1beta1StorageMapSpecMap[]) => void;
  reset: (preserveUpdated?: boolean) => void;
};

export const usePlanMappingsState = (
  planNetworkMaps: V1beta1NetworkMap,
  planStorageMaps: V1beta1StorageMap,
): UsePlanMappingsStateResult => {
  const [editMode, setEditMode] = useState(false);
  const [updatedNetwork, setUpdatedNetwork] = useState<V1beta1NetworkMapSpecMap[]>(
    planNetworkMaps?.spec?.map ?? [],
  );
  const [updatedStorage, setUpdatedStorage] = useState<V1beta1StorageMapSpecMap[]>(
    planStorageMaps?.spec?.map ?? [],
  );
  const [dataChanged, setDataChanged] = useState(false);

  useEffect(() => {
    setDataChanged(
      hasPlanMappingsChanged({
        originalNetwork: planNetworkMaps?.spec?.map,
        originalStorage: planStorageMaps?.spec?.map,
        updatedNetwork,
        updatedStorage,
      }),
    );
  }, [updatedNetwork, updatedStorage, planNetworkMaps, planStorageMaps]);

  const reset = (preserveUpdated = false) => {
    if (!preserveUpdated) {
      setUpdatedNetwork(planNetworkMaps?.spec?.map ?? []);
      setUpdatedStorage(planStorageMaps?.spec?.map ?? []);
    }
    setDataChanged(false);
    setEditMode(false);
  };

  return {
    dataChanged,
    editMode,
    reset,
    setEditMode,
    setUpdatedNetwork,
    setUpdatedStorage,
    updatedNetwork,
    updatedStorage,
  };
};
