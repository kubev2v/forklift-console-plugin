import { useMemo } from 'react';

import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

const usePlanSourceProvider = (
  plan: V1beta1Plan,
  namespace: string,
): WatchK8sResult<V1beta1Provider> => {
  const planSourceProviderName = plan?.spec?.provider?.source?.name;

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  const planSourceProvider = useMemo(
    () => providers?.find((provider) => provider.metadata.name === planSourceProviderName),
    [providers, planSourceProviderName],
  );

  return [planSourceProvider, providersLoaded, providersLoadError];
};

export default usePlanSourceProvider;
