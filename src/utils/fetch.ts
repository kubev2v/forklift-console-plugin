import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import type { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import { type TypedWatchK8sResult, useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

const useProviders = ({ namespace }: WatchK8sResource): TypedWatchK8sResult<V1beta1Provider[]> =>
  useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

const useHasSourceAndTargetProviders = (
  namespace?: string,
): [boolean, boolean, boolean, unknown] => {
  const [providers, providersLoaded, providersError] = useProviders({
    namespace,
  });

  const hasSourceProviders = !isEmpty(providers);
  const hasTargetProviders = providers.some((provider) => provider?.spec?.type === 'openshift');

  return [hasSourceProviders, hasTargetProviders, providersLoaded, providersError];
};

export const useHasSufficientProviders = (namespace?: string): boolean => {
  const [hasSourceProviders, hasTargetProviders, providersLoaded, providersError] =
    useHasSourceAndTargetProviders(namespace);
  const hasSufficientProviders =
    hasSourceProviders && hasTargetProviders && providersLoaded && !providersError;

  return hasSufficientProviders;
};
