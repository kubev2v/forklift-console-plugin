import { useMemo } from 'react';
import { ProviderResource } from 'src/utils/types';

import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';
import {
  K8sGroupVersionKind,
  useK8sWatchResource,
  WatchK8sResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

const IS_MOCK = process.env.DATA_SOURCE === 'mock';

function createRealK8sWatchResourceHook<T>(kind: string) {
  return function useRealHook(
    { namespace, name }: WatchK8sResource,
    { group, version }: Omit<K8sGroupVersionKind, 'kind'>,
  ): WatchK8sResult<T[]> {
    return useK8sWatchResource<T[]>({
      groupVersionKind: {
        group,
        version,
        kind,
      },
      isList: true,
      namespaced: true,
      namespace,
      name,
    });
  };
}

const useMockProviders = ({ name }: WatchK8sResource): WatchK8sResult<ProviderResource[]> => {
  const mockData: ProviderResource[] = useMemo(
    () =>
      !name
        ? (MOCK_CLUSTER_PROVIDERS as ProviderResource[])
        : (MOCK_CLUSTER_PROVIDERS?.filter(
            (provider) => provider?.metadata?.name === name,
          ) as ProviderResource[]),
    [name],
  );
  return [mockData, true, false];
};

export const useProviders = IS_MOCK
  ? useMockProviders
  : createRealK8sWatchResourceHook<ProviderResource>('Provider');
