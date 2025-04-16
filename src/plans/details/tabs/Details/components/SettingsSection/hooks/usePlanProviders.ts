import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanDestinationProvider, getPlanSourceProvider } from '@utils/crds/plans/selectors';

type UsePlanProviders = (plan: V1beta1Plan) => {
  destinationProvider: V1beta1Provider;
  sourceProvider: V1beta1Provider;
  sourceProviderLoaded: boolean;
  sourceProviderLoadError: Error;
  destinationProviderLoaded: boolean;
  destinationProviderError: Error;
};

const usePlanProviders: UsePlanProviders = (plan) => {
  const { name: sourceName, namespace: sourceNamespace } = getPlanSourceProvider(plan);
  const { name: destinationName, namespace: destinationNamespace } =
    getPlanDestinationProvider(plan);

  const [sourceProvider, sourceProviderLoaded, sourceProviderLoadError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: sourceName,
      namespace: sourceNamespace,
      namespaced: true,
    });

  const [destinationProvider, destinationProviderLoaded, destinationProviderError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: destinationName,
      namespace: destinationNamespace,
      namespaced: true,
    });

  return {
    destinationProvider,
    destinationProviderError,
    destinationProviderLoaded,
    sourceProvider,
    sourceProviderLoaded,
    sourceProviderLoadError,
  };
};

export default usePlanProviders;
