import { useMemo } from 'react';
import { ProviderResource } from 'src/utils/types';

import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';
import {
  useK8sWatchResource,
  WatchK8sResource,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

const IS_MOCK = process.env.DATA_SOURCE === 'mock';

function useRealK8sWatchResource<T>({
  kind,
  namespace,
  name,
}: WatchK8sResource): WatchK8sResult<T[]> {
  return useK8sWatchResource<T[]>({
    kind,
    isList: true,
    namespaced: true,
    namespace,
    name,
  });
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

export const useProviders = IS_MOCK ? useMockProviders : useRealK8sWatchResource;
