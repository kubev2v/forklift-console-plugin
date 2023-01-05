import { useMemo } from 'react';
import { MigrationResource, PlanResource, ProviderResource } from 'src/utils/types';

import { MOCK_MIGRATIONS } from '@app/queries/mocks/migrations.mock';
import { MOCK_PLANS } from '@app/queries/mocks/plans.mock';
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

const useMockPlans = ({ name }: WatchK8sResource): WatchK8sResult<PlanResource[]> => {
  const mockData: PlanResource[] = useMemo(
    () =>
      !name
        ? (MOCK_PLANS as PlanResource[])
        : (MOCK_PLANS?.filter((provider) => provider?.metadata?.name === name) as PlanResource[]),
    [name],
  );
  return [mockData, true, false];
};

const useMockMigrations = ({ name }: WatchK8sResource): WatchK8sResult<MigrationResource[]> => {
  const mockData: MigrationResource[] = useMemo(
    () =>
      !name
        ? (MOCK_MIGRATIONS as MigrationResource[])
        : (MOCK_MIGRATIONS?.filter(
            (provider) => provider?.metadata?.name === name,
          ) as MigrationResource[]),
    [name],
  );
  return [mockData, true, false];
};

export const usePlans = IS_MOCK
  ? useMockPlans
  : createRealK8sWatchResourceHook<PlanResource>('Plan');

export const useMigrations = IS_MOCK
  ? useMockMigrations
  : createRealK8sWatchResourceHook<MigrationResource>('Migration');
