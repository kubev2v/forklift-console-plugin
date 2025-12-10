import { useMemo } from 'react';
import { type InventoryStorage, useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { useOvirtDisksForVMs } from 'src/plans/create/hooks/useOvirtDisksForVMs';
import { getStorageMappingValues } from 'src/storageMaps/create/utils/buildStorageMappings';
import type { StorageMapping, TargetStorage } from 'src/storageMaps/utils/types';

import {
  type ProviderVirtualMachine,
  StorageMapModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  getPlanStorageMapName,
  getPlanStorageMapNamespace,
  getPlanTargetNamespace,
} from '@utils/crds/plans/selectors';
import useTargetStorages from '@utils/hooks/useTargetStorages';

type UsePlanStorageMapResourcesParams = {
  sourceProvider: V1beta1Provider;
  targetProvider: V1beta1Provider;
  plan: V1beta1Plan;
  vms: Record<string, ProviderVirtualMachine>;
};

type UsePlanStorageMapResources = ({
  plan,
  sourceProvider,
  targetProvider,
}: UsePlanStorageMapResourcesParams) => {
  storageMappings: StorageMapping[];
  storageMapResult: WatchK8sResult<V1beta1StorageMap>;
  vmsWithDisksResult: [ProviderVirtualMachine[], boolean, Error | null];
  sourceStoragesResult: [InventoryStorage[], boolean, Error | null];
  targetStoragesResult: [TargetStorage[], boolean, Error | null];
};

export const usePlanStorageMapResources: UsePlanStorageMapResources = ({
  plan,
  sourceProvider,
  targetProvider,
  vms,
}) => {
  const storageMapResult = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: false,
    name: getPlanStorageMapName(plan),
    namespace: getPlanStorageMapNamespace(plan),
  });

  const sourceStoragesResult = useSourceStorages(sourceProvider);
  const targetStoragesResult = useTargetStorages(targetProvider, getPlanTargetNamespace(plan));

  const storageMappings = useMemo(() => {
    const [storageMap] = storageMapResult ?? [];
    const [sourceStorages] = sourceStoragesResult ?? [];

    const sourceStoragesMap = new Map(sourceStorages.map((storage) => [storage.id, storage]));

    return getStorageMappingValues(storageMap?.spec?.map, sourceProvider, sourceStoragesMap) ?? [];
  }, [storageMapResult, sourceStoragesResult, sourceProvider]);

  //   Fetch VMs with disk information for oVirt providers
  const vmList = Object.values(vms || {});
  const {
    error: vmsWithDisksError,
    loading: vmsWithDisksLoading,
    vmsWithDisks,
  } = useOvirtDisksForVMs(sourceProvider, vmList);

  const vmsWithDisksResult: [ProviderVirtualMachine[], boolean, Error | null] = useMemo(
    () => [vmsWithDisks as ProviderVirtualMachine[], vmsWithDisksLoading, vmsWithDisksError],
    [vmsWithDisks, vmsWithDisksLoading, vmsWithDisksError],
  );

  return {
    sourceStoragesResult,
    storageMappings,
    storageMapResult,
    targetStoragesResult,
    vmsWithDisksResult,
  };
};
