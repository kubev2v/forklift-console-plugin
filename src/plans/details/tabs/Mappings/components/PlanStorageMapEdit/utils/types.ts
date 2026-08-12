import type { V1beta1Provider, V1beta1StorageMap } from '@forklift-ui/types';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import type { StorageMapping, TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

export type PlanStorageEditFormValues = {
  storageMap: StorageMapping[];
};

export type PlanStorageMapEditProps = {
  isLoading: boolean;
  loadError: Error | null;
  otherSourceStorages: MappingValue[];
  sourceProvider: V1beta1Provider;
  sourceStorages?: InventoryStorage[];
  storageMap: V1beta1StorageMap;
  storageMappings: StorageMapping[];
  targetStorages: TargetStorage[];
  usedSourceStorages: MappingValue[];
};
