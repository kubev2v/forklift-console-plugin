import { useCallback, useEffect, useState } from 'react';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Type for the return value of the useK8sWatchProviderNames hook.
 */
type K8sProvidersWatchResult = [string[] | undefined, boolean, Error | null];

/**
 * React hook to watch Provider resources and only trigger re-renders when the providers `metadata.name` changes.
 *
 * @param {string} namespace - namespace to watch.
 * @returns {K8sProvidersWatchResult} - An array of names.
 */
export const useK8sWatchProviderNames = ({
  namespace,
}: {
  namespace: string;
}): K8sProvidersWatchResult => {
  const [names, setNames] = useState<string[] | undefined>(undefined);
  const [namesLoaded, setLoaded] = useState(false);
  const [namesLoadError, setLoadError] = useState<Error | null>(null);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const handleLoadError = useCallback((error: Error | null) => {
    setLoadError(error);
    setLoaded(true);
  }, []);

  const handleLoadedProviders = useCallback((loadedProviders: V1beta1Provider[] | null) => {
    setLoaded(true);

    const loadedNames: string[] = (loadedProviders ?? []).reduce<string[]>((acc, nextProvider) => {
      if (nextProvider.metadata?.name) {
        acc.push(nextProvider.metadata.name);
      }
      return acc;
    }, []);

    setNames(loadedNames);
  }, []);

  useEffect(() => {
    if (providersLoaded) {
      if (providersLoadError) {
        handleLoadError(providersLoadError as Error);
        return;
      }
      handleLoadedProviders(providers);
    }
  }, [providers, providersLoaded, providersLoadError, handleLoadError, handleLoadedProviders]);

  return [names, namesLoaded, namesLoadError];
};
