import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import {
  useK8sWatchResource,
  type WatchK8sResource,
  type WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

const useProviders = ({ namespace }: WatchK8sResource): WatchK8sResult<V1beta1Provider[]> =>
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

  const hasSourceProviders = providers.length > 0;
  const hasTargetProviders = providers.some((provider) => provider?.spec?.type === 'openshift');

  return [hasSourceProviders, hasTargetProviders, providersLoaded, providersError];
};

export const useHasSufficientProviders = (namespace?: string) => {
  const [hasSourceProviders, hasTargetProviders, providersLoaded, providersError] =
    useHasSourceAndTargetProviders(namespace);
  const hasSufficientProviders =
    hasSourceProviders && hasTargetProviders && providersLoaded && !providersError;

  return hasSufficientProviders;
};
