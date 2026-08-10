import { useMemo } from 'react';

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
  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const names = useMemo(() => {
    if (!providersLoaded || providersLoadError) {
      return undefined;
    }

    return (providers ?? []).reduce<string[]>((acc, nextProvider) => {
      if (nextProvider.metadata?.name) {
        acc.push(nextProvider.metadata.name);
      }
      return acc;
    }, []);
  }, [providers, providersLoaded, providersLoadError]);

  let loadError: Error | null = null;
  if (providersLoadError !== undefined && providersLoadError !== null) {
    loadError =
      providersLoadError instanceof Error
        ? providersLoadError
        : new Error(String(providersLoadError));
  }

  return [names, providersLoaded, loadError];
};
