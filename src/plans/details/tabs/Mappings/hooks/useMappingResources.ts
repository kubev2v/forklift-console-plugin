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
  getPlanSourceProviderName,
} from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import { usePlanMappingData } from '../../../hooks/usePlanMappingData';

type MappingResources = {
  loadingResources: boolean;
  resourcesError: Error | undefined;
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

  const [providerNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  const [providerStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  const [targetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);

  const { planNetworkMap, planStorageMap, sourceNetworks, sourceStorages } = usePlanMappingData({
    networkMaps,
    plan,
    providerNetworks,
    providerStorages,
    sourceProvider,
    storageMaps,
  });

  const resourcesError = () => {
    if (!isEmpty(providersLoadError as Error)) return providersLoadError as Error;

    if (!isEmpty(networkMapsError as Error)) return networkMapsError as Error;

    if (!isEmpty(storageMapsError as Error)) return storageMapsError as Error;

    if (!isEmpty(sourceNetworksError)) return sourceNetworksError!;

    if (!isEmpty(targetNetworksError)) return targetNetworksError!;

    if (!isEmpty(sourceStoragesError)) return sourceStoragesError!;

    if (!isEmpty(targetStoragesError)) return targetStoragesError!;

    return undefined;
  };

  return {
    loadingResources:
      !providersLoaded ||
      !networkMapsLoaded ||
      !storageMapsLoaded ||
      sourceNetworksLoading ||
      targetNetworksLoading ||
      sourceStoragesLoading ||
      targetStoragesLoading,
    planNetworkMap: planNetworkMap ?? null,
    planStorageMap: planStorageMap ?? null,
    resourcesError: resourcesError(),
    sourceNetworks: sourceNetworks ?? [],
    sourceStorages: sourceStorages ?? [],
    targetNetworks: targetNetworks ?? [],
    targetStorages: targetStorages ?? [],
  };
};
