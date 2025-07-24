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

  // DEBUG: Log provider hook state for button debugging
  // eslint-disable-next-line no-console
  console.log('🔍 useHasSourceAndTargetProviders DEBUG:', {
    namespace,
    providersCount: providers?.length || 0,
    providersLoaded,
    providersError: providersError ? String(providersError) : null,
    providers:
      providers?.map((p) => ({
        name: p.metadata?.name,
        type: p.spec?.type,
        namespace: p.metadata?.namespace,
      })) || [],
  });

  const hasSourceProviders = providers.length > 0;
  const hasTargetProviders = providers.some((provider) => provider?.spec?.type === 'openshift');

  // DEBUG: Log the calculated boolean states
  // eslint-disable-next-line no-console
  console.log('🔍 Provider states:', {
    hasSourceProviders,
    hasTargetProviders,
    providersLoaded,
    hasError: !!providersError,
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
    namespace,
    hasSourceProviders,
    hasTargetProviders,
    providersLoaded,
    hasError: !!providersError,
    hasSufficientProviders,
    failureReason: !hasSufficientProviders
      ? !hasSourceProviders
        ? 'No source providers'
        : !hasTargetProviders
          ? 'No target (openshift) providers'
          : !providersLoaded
            ? 'Providers not loaded yet'
            : providersError
              ? 'Providers error: ' + String(providersError)
              : 'Unknown reason'
      : null,
  });

  return hasSufficientProviders;
};
