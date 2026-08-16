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
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

export const usePlanProviders = (plan: V1beta1Plan) => {
  const [sourceProvider, sourceProviderLoaded, sourceProviderError] =
    useTypedK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getPlanSourceProviderName(plan),
      namespace: getPlanSourceProviderNamespace(plan),
      namespaced: true,
    });

  const [targetProvider, targetProviderLoaded, targetProviderError] =
    useTypedK8sWatchResource<V1beta1Provider>({
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
