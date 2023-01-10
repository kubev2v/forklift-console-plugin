import * as React from 'react';
import { UseMutationResult, useQueryClient, UseQueryResult, QueryStatus } from 'react-query';
import * as yup from 'yup';
import {
  IOpenShiftProvider,
  MappingType,
  MappingSource,
  MappingTarget,
  Mapping,
  POD_NETWORK,
  IMetaObjectMeta,
  SourceInventoryProvider,
} from './types';
import {
  getAggregateQueryStatus,
  getFirstQueryError,
  mockKubeList,
  sortKubeListByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';

import { checkIfResourceExists, createResource, ForkliftResourceKind } from '@app/client/helpers';
import { dnsLabelNameSchema } from '@app/common/constants';
import { KubeClientError, IKubeList, IKubeResponse, IKubeStatus } from '@app/client/types';
import { MOCK_NETWORK_MAPPINGS, MOCK_STORAGE_MAPPINGS } from './mocks/mappings.mock';
import { usePollingContext } from '@app/common/context';
import { useAuthorizedK8sClient } from './fetchHelpers';
import {
  useOpenShiftNetworksQuery,
  useSourceNetworksQuery,
  useSourceStoragesQuery,
  useStorageClassesQuery,
  findProvidersByRefs,
  useInventoryProvidersQuery,
} from '@app/queries';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { KubeResource } from '@migtools/lib-ui';

export const getMappingResource = (
  mappingType: MappingType,
  namespace: string
): { kind: ForkliftResourceKind; resource: KubeResource } => {
  const kind =
    mappingType === MappingType.Network
      ? ForkliftResourceKind.NetworkMap
      : ForkliftResourceKind.StorageMap;
  const resource = createResource(kind, namespace);
  return { kind, resource };
};

export const useMappingsQuery = (
  mappingType: MappingType,
  namespace: string
): UseQueryResult<IKubeList<Mapping>> => {
  const sortKubeListByNameCallback = React.useCallback(
    (data): IKubeList<Mapping> => sortKubeListByName(data),
    []
  );
  const { resource } = getMappingResource(mappingType, namespace);
  const result = useMockableQuery<IKubeList<Mapping>>(
    {
      queryKey: ['mappings', mappingType],
      queryFn: async () => await consoleFetchJSON(resource.listPath()),
      refetchInterval: usePollingContext().refetchInterval,
      select: sortKubeListByNameCallback,
    },
    mappingType === MappingType.Network
      ? mockKubeList(MOCK_NETWORK_MAPPINGS, 'NetworkMapList')
      : mockKubeList(MOCK_STORAGE_MAPPINGS, 'StorageMapList')
  );
  return result;
};

export const useCreateMappingMutation = (
  mappingType: MappingType,
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<
  IKubeResponse<Mapping>,
  KubeClientError,
  Mapping,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<Mapping>, KubeClientError, Mapping>(
    async (mapping) => {
      const { kind, resource } = getMappingResource(mappingType, namespace);
      const existingMappingName = (mapping.metadata as IMetaObjectMeta).name || null;
      if (existingMappingName) {
        await checkIfResourceExists(client, kind, resource, existingMappingName);
      }
      return await client.create<Mapping>(resource, mapping);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mappings', mappingType]);
        onSuccess && onSuccess();
      },
    }
  );
};

export const useCreateMappingMutations = (
  namespace: string
): {
  network: ReturnType<typeof useCreateMappingMutation>;
  storage: ReturnType<typeof useCreateMappingMutation>;
} => ({
  network: useCreateMappingMutation(MappingType.Network, namespace),
  storage: useCreateMappingMutation(MappingType.Storage, namespace),
});

export const usePatchMappingMutation = (
  mappingType: MappingType,
  namespace: string,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<Mapping>, KubeClientError, Mapping, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<Mapping>, KubeClientError, Mapping>(
    async (mapping: Mapping) => {
      const { resource } = getMappingResource(mappingType, namespace);
      return await client.patch(resource, (mapping.metadata as IMetaObjectMeta).name, mapping);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mappings', mappingType]);
        onSuccess && onSuccess();
      },
    }
  );
};

export const usePatchMappingMutations = (
  namespace: string
): {
  network: ReturnType<typeof usePatchMappingMutation>;
  storage: ReturnType<typeof usePatchMappingMutation>;
} => ({
  network: usePatchMappingMutation(MappingType.Network, namespace),
  storage: usePatchMappingMutation(MappingType.Storage, namespace),
});

export const useDeleteMappingMutation = (
  mappingType: MappingType,
  namespace: string,
  onSuccess?: () => void
) => {
  const client = useAuthorizedK8sClient();
  const { resource } = getMappingResource(mappingType, namespace);
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, Mapping>(
    (mapping: Mapping) => client.delete(resource, (mapping.metadata as IMetaObjectMeta).name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mappings', mappingType]);
        onSuccess && onSuccess();
      },
    }
  );
};

export interface IMappingResourcesResult {
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  isLoading: boolean;
  isError: boolean;
  status: QueryStatus;
  error: unknown; // TODO not sure how to handle error types yet
  queries: UseQueryResult<unknown>[];
}

export interface ISpecificMappingResourcesResult extends IMappingResourcesResult {
  sourceProvider: SourceInventoryProvider | null;
  targetProvider: IOpenShiftProvider | null;
}

export const useMappingResourceQueries = (
  sourceProvider: SourceInventoryProvider | null,
  targetProvider: IOpenShiftProvider | null,
  mappingType: MappingType
): IMappingResourcesResult => {
  const sourceNetworksQuery = useSourceNetworksQuery(sourceProvider, mappingType);
  const sourceStoragesQuery = useSourceStoragesQuery(sourceProvider, mappingType);
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(targetProvider, mappingType);
  const storageClassesQuery = useStorageClassesQuery(
    targetProvider ? [targetProvider] : null,
    mappingType
  );

  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
  if (mappingType === MappingType.Network) {
    availableSources = (sourceProvider && sourceNetworksQuery.data) || [];
    availableTargets =
      targetProvider && openshiftNetworksQuery.data
        ? [POD_NETWORK, ...(openshiftNetworksQuery.data || [])]
        : [];
  }
  if (mappingType === MappingType.Storage) {
    availableSources = (sourceProvider && sourceStoragesQuery.data) || [];
    availableTargets =
      (targetProvider &&
        storageClassesQuery.data &&
        storageClassesQuery.data[targetProvider.name]) ||
      [];
  }

  const queriesToWatch =
    mappingType === MappingType.Network
      ? [sourceNetworksQuery, openshiftNetworksQuery]
      : [sourceStoragesQuery, storageClassesQuery];
  const status = getAggregateQueryStatus(queriesToWatch);
  const error = getFirstQueryError(queriesToWatch);

  return {
    availableSources,
    availableTargets,
    isLoading: status === 'loading',
    isError: status === 'error',
    status,
    error,
    queries: queriesToWatch,
  };
};

export const useResourceQueriesForMapping = (
  mappingType: MappingType,
  mapping: Mapping | null
): ISpecificMappingResourcesResult => {
  const providersQuery = useInventoryProvidersQuery();
  const { sourceProvider, targetProvider } = findProvidersByRefs(
    mapping?.spec.provider || null,
    providersQuery
  );
  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );
  const allQueries = [providersQuery, ...mappingResourceQueries.queries];
  const status = getAggregateQueryStatus(allQueries);
  const error = getFirstQueryError(allQueries);
  return {
    ...mappingResourceQueries,
    queries: allQueries,
    isLoading: status === 'loading',
    isError: status === 'error',
    status,
    error,
    sourceProvider,
    targetProvider,
  };
};

export const getMappingNameSchema = (
  mappingsQuery: UseQueryResult<IKubeList<Mapping>>,
  mappingBeingEdited: Mapping | null
): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A mapping with this name already exists', (value) => {
    if (mappingBeingEdited && (mappingBeingEdited.metadata as IMetaObjectMeta).name === value)
      return true;
    if (
      mappingsQuery.data?.items.find(
        (mapping) => mapping && (mapping.metadata as IMetaObjectMeta).name === value
      )
    )
      return false;
    return true;
  });

export const filterSharedMappings = (mappings?: Mapping[]): Mapping[] =>
  (mappings || []).filter(
    (mapping) => mapping.metadata.annotations?.['forklift.konveyor.io/shared'] !== 'false'
  ) || null;
