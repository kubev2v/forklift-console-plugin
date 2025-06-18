import { useMemo } from 'react';

import {
  ProviderModelGroupVersionKind,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';

/**
 * Finds source and target providers from provider list based on storage map references
 */
const getStorageMapProviders = (providers: V1beta1Provider[], storageMap: V1beta1StorageMap) => {
  const sourceRef = storageMap?.spec?.provider?.source;
  const targetRef = storageMap?.spec?.provider?.destination;

  return {
    sourceProvider: providers.find(
      (provider) =>
        provider?.metadata?.uid === sourceRef?.uid || provider?.metadata?.name === sourceRef?.name,
    ),
    targetProvider: providers.find(
      (provider) =>
        provider?.metadata?.uid === targetRef?.uid || provider?.metadata?.name === targetRef?.name,
    ),
  };
};

/**
 * Custom hook to manage provider fetching and resolution for storage maps
 */
export const useStorageMapProviders = (storageMap: V1beta1StorageMap) => {
  const storageMapNamespace = getNamespace(storageMap);

  // Fetch all providers in the namespace
  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace: storageMapNamespace,
    namespaced: true,
  });

  // Find source and target providers
  const { sourceProvider, targetProvider } = useMemo(
    () => getStorageMapProviders(providers, storageMap),
    [providers, storageMap],
  );

  return {
    providers,
    providersLoaded,
    providersLoadError,
    sourceProvider,
    targetProvider,
  };
};
