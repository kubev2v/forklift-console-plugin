import { useMemo } from 'react';

import { ProviderModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

const usePlanSourceProvider = (
  plan: V1beta1Plan,
  namespace: string,
): WatchK8sResult<V1beta1Provider> => {
  const planSourceProviderName = plan?.spec?.provider?.source?.name;

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  const planSourceProvider = useMemo(
    () => providers?.find((provider) => provider.metadata.name === planSourceProviderName),
    [providers, planSourceProviderName],
  );

  return [planSourceProvider, providersLoaded, providersLoadError];
};

export default usePlanSourceProvider;
