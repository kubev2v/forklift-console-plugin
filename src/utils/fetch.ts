import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import {
  useK8sWatchResource,
  type WatchK8sResource,
  type WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

const useProviders = ({ namespace }: WatchK8sResource): WatchK8sResult<V1beta1Provider[]> => {
  const result = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  // DEBUG: Log what useK8sWatchResource is actually returning
  const [providers, loaded, error] = result;

  // ENHANCED DEBUG: More detailed logging
  // eslint-disable-next-line no-console
  console.log('📡 useProviders hook DETAILED result:', {
    error: error ? String(error) : null,
    // Log the exact API endpoint that should be called
    expectedApiEndpoint: namespace
      ? `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${namespace}/providers`
      : `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/providers`,
    isProvidersArray: Array.isArray(providers),
    loaded,
    namespace: namespace ?? 'undefined/cluster-wide',
    providersReceived: providers?.length ?? 0,
    rawProviders: providers,
    rawProvidersType: typeof providers,
    watchResourceConfig: {
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: true,
    },
  });

  return result;
};

const useHasSourceAndTargetProviders = (
  namespace?: string,
): [boolean, boolean, boolean, unknown] => {
  const [providers, providersLoaded, providersError] = useProviders({
    namespace,
  });

  // DEBUG: Log provider hook state for button debugging
  // eslint-disable-next-line no-console
  console.log('🔍 useHasSourceAndTargetProviders DEBUG:', {
    namespace,
    providers:
      providers?.map((provider) => ({
        name: provider.metadata?.name,
        namespace: provider.metadata?.namespace,
        type: provider.spec?.type,
      })) || [],
    providersCount: providers?.length || 0,
    providersError: providersError ? String(providersError) : null,
    providersLoaded,
  });

  const hasSourceProviders = providers.length > 0;
  const hasTargetProviders = providers.some((provider) => provider?.spec?.type === 'openshift');

  // DEBUG: Log the calculated boolean states
  // eslint-disable-next-line no-console
  console.log('🔍 Provider states:', {
    hasError: Boolean(providersError),
    hasSourceProviders,
    hasTargetProviders,
    providersLoaded,
  });

  return [hasSourceProviders, hasTargetProviders, providersLoaded, providersError];
};

export const useHasSufficientProviders = (namespace?: string) => {
  const [hasSourceProviders, hasTargetProviders, providersLoaded, providersError] =
    useHasSourceAndTargetProviders(namespace);
  const hasSufficientProviders =
    hasSourceProviders && hasTargetProviders && providersLoaded && !providersError;

  // DEBUG: Log final sufficient providers calculation
  // eslint-disable-next-line no-console
  console.log('🔍 useHasSufficientProviders RESULT:', {
    hasError: Boolean(providersError),
    hasSourceProviders,
    hasSufficientProviders,
    hasTargetProviders,
    namespace,
    providersLoaded,
  });

  return hasSufficientProviders;
};
