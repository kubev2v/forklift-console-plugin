import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseProvider = (
  name: string | undefined,
  namespace: string | undefined,
) => {
  loaded: boolean;
  loadError: Error | null;
  provider: V1beta1Provider;
};

export const useProvider: UseProvider = (name, namespace) => {
  const shouldWatch = Boolean(name && namespace);

  const [provider, loaded, loadError] = useK8sWatchResource<V1beta1Provider>(
    shouldWatch
      ? {
          groupVersionKind: ProviderModelGroupVersionKind,
          name,
          namespace,
          namespaced: true,
        }
      : null,
  );

  return {
    loaded,
    loadError,
    provider,
  };
};
