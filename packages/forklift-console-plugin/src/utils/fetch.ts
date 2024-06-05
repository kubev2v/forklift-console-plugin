import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import {
  useK8sWatchResource,
  WatchK8sResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

export const useProviders = ({
  namespace,
  name,
}: WatchK8sResource): WatchK8sResult<V1beta1Provider[]> =>
  useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
    name,
  });

export const useHasSourceAndTargetProviders = (
  namespace?: string,
): [boolean, boolean, boolean, unknown] => {
  const [providers, providersLoaded, providersError] = useProviders({
    namespace,
  });

  const hasSourceProviders = providers.length > 0;
  const hasTargetProviders = providers.some((p) => p?.spec?.type === 'openshift');

  return [hasSourceProviders, hasTargetProviders, providersLoaded, providersError];
};

export const useHasSufficientProviders = (namespace?: string) => {
  const [hasSourceProviders, hasTargetProviders, providersLoaded, providersError] =
    useHasSourceAndTargetProviders(namespace);
  const hasSufficientProviders =
    hasSourceProviders && hasTargetProviders && providersLoaded && !providersError;

  return hasSufficientProviders;
};
