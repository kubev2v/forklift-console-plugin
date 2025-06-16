import { type Dispatch, type SetStateAction, useState } from 'react';

import type {
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { deepCopy } from '@utils/deepCopy';

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
  planNetworkMap: V1beta1NetworkMap,
  planStorageMap: V1beta1StorageMap,
): UsePlanMappingsStateResult => {
  const [editMode, setEditMode] = useState(false);
  const [updatedNetwork, setUpdatedNetwork] = useState<V1beta1NetworkMapSpecMap[]>(
    deepCopy(planNetworkMap?.spec?.map) ?? [],
  );
  const [updatedStorage, setUpdatedStorage] = useState<V1beta1StorageMapSpecMap[]>(
    deepCopy(planStorageMap?.spec?.map) ?? [],
  );
  const [dataChanged, setDataChanged] = useState(false);

  const reset = (preserveUpdated = false) => {
    if (!preserveUpdated) {
      setUpdatedNetwork(planNetworkMap?.spec?.map ?? []);
      setUpdatedStorage(planStorageMap?.spec?.map ?? []);
    }
    setDataChanged(false);
    setEditMode(false);
  };

  const onNetworkChange: Dispatch<SetStateAction<V1beta1NetworkMapSpecMap[]>> = (value) => {
    setDataChanged(true);
    setUpdatedNetwork(value);
  };

  const onStorageChange: Dispatch<SetStateAction<V1beta1StorageMapSpecMap[]>> = (value) => {
    setDataChanged(true);
    setUpdatedStorage(value);
  };

  return {
    dataChanged,
    editMode,
    reset,
    setEditMode,
    setUpdatedNetwork: onNetworkChange,
    setUpdatedStorage: onStorageChange,
    updatedNetwork,
    updatedStorage,
  };
};
