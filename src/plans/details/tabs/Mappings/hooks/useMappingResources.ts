import { useMemo } from 'react';
import {
  type InventoryNetwork,
  useOpenShiftNetworks,
  useSourceNetworks,
} from 'src/modules/Providers/hooks/useNetworks';
import {
  type InventoryStorage,
  useOpenShiftStorages,
  useSourceStorages,
} from 'src/modules/Providers/hooks/useStorages';

import {
  NetworkMapModelGroupVersionKind,
  type OpenShiftNetworkAttachmentDefinition,
  type OpenShiftStorageClass,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import {
  getPlanDestinationProviderName,
  getPlanNetworkMapName,
  getPlanSourceProviderName,
  getPlanStorageMapName,
} from '@utils/crds/plans/selectors';

type MappingResources = {
  loadingResources: boolean;
  resourcesError: Error | undefined;
  networkMaps: V1beta1NetworkMap[];
  storageMaps: V1beta1StorageMap[];
  planNetworkMap: V1beta1NetworkMap | null;
  planStorageMap: V1beta1StorageMap | null;
  sourceNetworks: InventoryNetwork[];
  sourceStorages: InventoryStorage[];
  targetNetworks: OpenShiftNetworkAttachmentDefinition[];
  targetStorages: OpenShiftStorageClass[];
};

export const useMappingResources = (plan: V1beta1Plan): MappingResources => {
  const namespace = getNamespace(plan);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [networkMaps, networkMapsLoaded, networkMapsError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [storageMaps, storageMapsLoaded, storageMapsError] = useK8sWatchResource<
    V1beta1StorageMap[]
  >({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const planNetworkMaps = useMemo(
    () => (networkMaps ?? []).find((net) => getName(net) === getPlanNetworkMapName(plan)),
    [networkMaps, plan],
  );

  const planStorageMaps = useMemo(
    () => (storageMaps ?? []).find((storage) => getName(storage) === getPlanStorageMapName(plan)),
    [storageMaps, plan],
  );

  const sourceProvider = useMemo(
    () =>
      (providers ?? []).find((provider) => getName(provider) === getPlanSourceProviderName(plan)),
    [providers, plan],
  );

  const targetProvider = useMemo(
    () =>
      (providers ?? []).find(
        (provider) => getName(provider) === getPlanDestinationProviderName(plan),
      ),
    [providers, plan],
  );

  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  const [sourceStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  const [targetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);

  return {
    loadingResources:
      !providersLoaded ||
      !networkMapsLoaded ||
      !storageMapsLoaded ||
      sourceNetworksLoading ||
      targetNetworksLoading ||
      sourceStoragesLoading ||
      targetStoragesLoading,
    networkMaps: networkMaps ?? [],
    planNetworkMap: planNetworkMaps ?? null,
    planStorageMap: planStorageMaps ?? null,
    resourcesError:
      providersLoadError ??
      networkMapsError ??
      storageMapsError ??
      sourceNetworksError ??
      targetNetworksError ??
      sourceStoragesError ??
      targetStoragesError,
    sourceNetworks: sourceNetworks ?? [],
    sourceStorages: sourceStorages ?? [],
    storageMaps: storageMaps ?? [],
    targetNetworks: targetNetworks ?? [],
    targetStorages: targetStorages ?? [],
  };
};
