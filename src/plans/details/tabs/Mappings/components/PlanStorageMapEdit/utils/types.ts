import type { V1beta1Provider, V1beta1StorageMap } from '@forklift-ui/types';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import type { StorageMapping, TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

export type PlanStorageEditFormValues = {
  storageMap: StorageMapping[];
};

export type PlanStorageMapEditProps = {
  storageMap: V1beta1StorageMap;
  sourceProvider: V1beta1Provider;
  sourceStorages?: InventoryStorage[];
  storageMappings: StorageMapping[];
  otherSourceStorages: MappingValue[];
  usedSourceStorages: MappingValue[];
  targetStorages: TargetStorage[];
  isLoading: boolean;
  loadError: Error | null;
};
