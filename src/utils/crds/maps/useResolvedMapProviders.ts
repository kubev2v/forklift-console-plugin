import {
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { resolveProvider } from './resolveProvider';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
  getMapSourceProviderNamespace,
} from './selectors';

type MapWithProviders = V1beta1NetworkMap | V1beta1StorageMap;

type ResolvedMapProviders = {
  destinationProvider: V1beta1Provider | undefined;
  providersLoadError: Error | null;
  providersReady: boolean;
  sourceProvider: V1beta1Provider | undefined;
};

export const useResolvedMapProviders = (
  mapResource: MapWithProviders | undefined,
  launchedSourceProvider?: V1beta1Provider,
  launchedDestinationProvider?: V1beta1Provider,
): ResolvedMapProviders => {
  const [watchedSourceProvider, sourceProviderLoaded, sourceProviderError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getMapSourceProviderName(mapResource),
      namespace: getMapSourceProviderNamespace(mapResource),
      namespaced: true,
    });
  const [watchedDestinationProvider, destinationProviderLoaded, destinationProviderError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getMapDestinationProviderName(mapResource),
      namespace: getMapDestinationProviderNamespace(mapResource),
      namespaced: true,
    });

  const sourceProvider = resolveProvider(
    watchedSourceProvider,
    sourceProviderLoaded,
    launchedSourceProvider,
  );
  const destinationProvider = resolveProvider(
    watchedDestinationProvider,
    destinationProviderLoaded,
    launchedDestinationProvider,
  );

  return {
    destinationProvider,
    providersLoadError: sourceProviderError ?? destinationProviderError,
    providersReady: Boolean(sourceProvider?.metadata?.uid && destinationProvider?.metadata?.uid),
    sourceProvider,
  };
};
