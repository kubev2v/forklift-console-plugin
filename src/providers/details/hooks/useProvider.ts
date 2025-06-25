import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseProvider = (
  name: string,
  namespace: string,
) => {
  loaded: boolean;
  loadError: Error | null;
  provider: V1beta1Provider;
};

export const useProvider: UseProvider = (name, namespace) => {
  const [provider, loaded, loadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  return {
    loaded,
    loadError,
    provider,
  };
};
