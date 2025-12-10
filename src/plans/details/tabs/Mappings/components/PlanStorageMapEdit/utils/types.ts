import type { MappingValue } from 'src/plans/create/types';
import type { StorageMapping, TargetStorage } from 'src/storageMaps/utils/types';

import type { V1beta1Provider, V1beta1StorageMap } from '@kubev2v/types';

export type PlanStorageEditFormValues = {
  storageMap: StorageMapping[];
};

export type PlanStorageMapEditProps = {
  storageMap: V1beta1StorageMap;
  sourceProvider: V1beta1Provider;
  storageMappings: StorageMapping[];
  otherSourceStorages: MappingValue[];
  usedSourceStorages: MappingValue[];
  targetStorages: TargetStorage[];
  isLoading: boolean;
  loadError: Error | null;
};
