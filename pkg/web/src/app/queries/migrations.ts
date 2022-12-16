import * as React from 'react';
import { UseMutationResult, UseQueryResult, useQueryClient } from 'react-query';
import { ForkliftResource, ForkliftResourceKind, checkIfResourceExists } from '@app/client/helpers';
import { IKubeList, IKubeResponse, KubeClientError } from '@app/client/types';
import { CLUSTER_API_VERSION, ENV } from '@app/common/constants';
import {
  isSameResource,
  mockKubeList,
  nameAndNamespace,
  sortKubeListByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { ICanceledVM, IMigration } from './types/migrations.types';
import { IPlan } from './types/plans.types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { usePollingContext } from '@app/common/context';
import { getObjectRef } from '@app/common/helpers';
import { SourceVM } from './types/vms.types';
import { MOCK_MIGRATIONS } from './mocks/migrations.mock';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

const migrationResource = new ForkliftResource(ForkliftResourceKind.Migration, ENV.NAMESPACE);

export const useCreateMigrationMutation = (
  onSuccess?: (migration: IMigration) => void
): UseMutationResult<IKubeResponse<IMigration>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<IMigration>, KubeClientError, IPlan>(
    async (plan: IPlan) => {
      const migration: IMigration = {
        apiVersion: CLUSTER_API_VERSION,
        kind: 'Migration',
        metadata: {
          name: `${plan.metadata.name}-${Date.now()}`,
          namespace: ENV.NAMESPACE,
          ownerReferences: [getObjectRef(plan)],
        },
        spec: {
          plan: nameAndNamespace(plan.metadata),
        },
      };
      await checkIfResourceExists(
        client,
        ForkliftResourceKind.Migration,
        migrationResource,
        migration.metadata.name
      );
      return await client.create(migrationResource, migration);
    },
    {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries('migrations');
        onSuccess && onSuccess(data);
      },
    }
  );
};

export const useMigrationsQuery = (): UseQueryResult<IKubeList<IMigration>> => {
  const sortKubeListByNameCallback = React.useCallback(
    (data): IKubeList<IMigration> => sortKubeListByName(data),
    []
  );
  const result = useMockableQuery<IKubeList<IMigration>>(
    {
      queryKey: 'migrations',
      queryFn: async () => await consoleFetchJSON(migrationResource.listPath()),
      refetchInterval: usePollingContext().refetchInterval,
      select: sortKubeListByNameCallback,
    },
    mockKubeList(MOCK_MIGRATIONS, 'Migration')
  );
  return result;
};

export const findLatestMigration = (
  plan: IPlan | null,
  migrations: IMigration[] | null
): IMigration | null => {
  const history = plan?.status?.migration?.history;
  const latestMigrationMeta = history ? history[history.length - 1].migration : null;
  if (migrations && latestMigrationMeta) {
    return (
      migrations.find((migration) => isSameResource(migration.metadata, latestMigrationMeta)) ||
      null
    );
  }
  return null;
};

export const useLatestMigrationQuery = (plan: IPlan | null): IMigration | null => {
  const migrationsQuery = useMigrationsQuery();
  return findLatestMigration(plan, migrationsQuery.data?.items || null);
};

export const useCancelVMsMutation = (
  plan: IPlan | null,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<IMigration>, KubeClientError, SourceVM[], unknown> => {
  const latestMigration = useLatestMigrationQuery(plan);
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<IMigration>, KubeClientError, SourceVM[]>(
    (vms: SourceVM[]) => {
      if (!latestMigration) return Promise.reject('Cannot find active Migration CR');
      const existingCanceledVMs = latestMigration.spec.cancel || [];
      const newCanceledVMs = vms
        .filter(
          (vm) =>
            !existingCanceledVMs.find(
              (canceledVM) => canceledVM.id == vm.id && canceledVM.name === vm.name
            )
        )
        .map(
          (vm): ICanceledVM => ({
            id: vm.id,
            name: vm.name,
          })
        );
      const migrationPatch: Partial<IMigration> = {
        spec: {
          ...latestMigration.spec,
          plan: nameAndNamespace(plan?.metadata),
          cancel: [...existingCanceledVMs, ...newCanceledVMs],
        },
      };
      return client.patch<IMigration>(
        migrationResource,
        latestMigration.metadata.name,
        migrationPatch
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries('migrations');
        onSuccess && onSuccess();
      },
    }
  );
};

export interface ISetCutoverArgs {
  plan: IPlan;
  cutover: string | null;
}

export const useSetCutoverMutation = (
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<IMigration>, KubeClientError, ISetCutoverArgs, unknown> => {
  const migrationsQuery = useMigrationsQuery();
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<IMigration>, KubeClientError, ISetCutoverArgs>(
    ({ plan, cutover }) => {
      const latestMigration = findLatestMigration(plan, migrationsQuery.data?.items || null);
      if (!latestMigration) return Promise.reject('Cannot find active Migration CR');
      const migrationPatch: Partial<IMigration> = {
        spec: { ...latestMigration.spec, cutover },
      };
      return client.patch<IMigration>(
        migrationResource,
        latestMigration.metadata.name,
        migrationPatch
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries('migrations');
        onSuccess && onSuccess();
      },
    }
  );
};
