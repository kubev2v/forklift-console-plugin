import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@forklift-ui/types';
import {
  getPlanDestinationProviderName,
  getPlanDestinationProviderNamespace,
  getPlanSourceProviderName,
  getPlanSourceProviderNamespace,
} from '@utils/crds/plans/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

type UsePlanProvidersResult = {
  error: Error | null;
  loaded: boolean;
  sourceProvider: V1beta1Provider;
  targetProvider: V1beta1Provider;
};

export const usePlanProviders = (plan: V1beta1Plan): UsePlanProvidersResult => {
  const [sourceProvider, sourceProviderLoaded, sourceProviderError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getPlanSourceProviderName(plan),
      namespace: getPlanSourceProviderNamespace(plan),
      namespaced: true,
    });

  const [targetProvider, targetProviderLoaded, targetProviderError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getPlanDestinationProviderName(plan),
      namespace: getPlanDestinationProviderNamespace(plan),
      namespaced: true,
    });

  return {
    error: targetProviderError ?? sourceProviderError,
    loaded: targetProviderLoaded && sourceProviderLoaded,
    sourceProvider,
    targetProvider,
  };
};
