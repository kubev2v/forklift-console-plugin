import { ProviderResource } from 'src/internal/k8s';

import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

const isMock = process.env.DATA_SOURCE === 'mock';

export function useMockableK8sWatchResource<T>(
  { kind, namespace, name },
  mockData: T[] = [],
): WatchK8sResult<T[]> {
  return isMock
    ? [mockData, true, false]
    : useK8sWatchResource<T[]>({
        kind,
        isList: true,
        namespaced: true,
        namespace,
        name,
      });
}

export const useProviders = ({ kind, namespace, name }) =>
  useMockableK8sWatchResource<ProviderResource>(
    { kind, namespace, name },
    MOCK_CLUSTER_PROVIDERS?.filter(
      (provider) => !name || provider?.metadata?.name === name,
    ) as ProviderResource[],
  );
