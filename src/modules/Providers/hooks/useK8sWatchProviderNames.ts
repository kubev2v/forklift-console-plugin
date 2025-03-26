import { useEffect, useState } from 'react';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
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
export const useK8sWatchProviderNames = ({ namespace }): K8sProvidersWatchResult => {
  const [names, setNames] = useState<string[] | undefined>(undefined);
  const [namesLoaded, setLoaded] = useState(false);
  const [namesLoadError, setLoadError] = useState<Error | null>(null);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  useEffect(() => {
    if (providersLoaded && providersLoadError) {
      handleLoadError(providersLoadError);
    } else if (providersLoaded) {
      handleLoadedProviders(providers);
    }
  }, [providers, providersLoaded, providersLoadError]);

  const handleLoadError = (error: Error | null) => {
    setLoadError(error);
    setLoaded(true);
  };

  const handleLoadedProviders = (providers: V1beta1Provider[] | null) => {
    setLoaded(true);

    const names = (providers || []).map((p) => p.metadata.name);
    setNames(names.filter((n) => n));
  };

  return [names, namesLoaded, namesLoadError];
};
