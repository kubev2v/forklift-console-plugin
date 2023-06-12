import { useCallback, useMemo } from 'react';
import { createSecretResource } from 'legacy/src/client/helpers';
import { usePollingContext } from 'legacy/src/common/context';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { UseQueryResult } from 'react-query';
import { mockKubeList, useMockableQuery } from './helpers';
import { MOCK_SECRET_INSECURE, MOCK_SECRET_SECURE } from './mocks/secrets.mock';
import { IMetaObjectMeta, IProviderObject, ISecret } from './types';
import { IKubeList } from '../client/types';

export const useSecretQuery = (
  secretName: string | null,
  namespace: string
): UseQueryResult<ISecret> => {
  const secretResource = createSecretResource(namespace);
  return useMockableQuery<ISecret>(
    {
      queryKey: ['secret', secretName],
      queryFn: async () => await consoleFetchJSON(secretResource.namedPath(secretName)),
      refetchInterval: usePollingContext().refetchInterval,
      enabled: !!secretName,
    },
    secretName === 'secure' ? MOCK_SECRET_SECURE : MOCK_SECRET_INSECURE
  );
};

export const useSecretsQuery = (
  secretNames: string[] | null,
  namespace: string
): UseQueryResult<IKubeList<ISecret>> => {
  const filterList = useCallback(
    (data: IKubeList<ISecret>): IKubeList<ISecret> =>
      !secretNames || secretNames.length == 0
        ? data
        : {
            ...data,
            items: data.items.filter((d) =>
              secretNames.includes((d.metadata as IMetaObjectMeta)?.name)
            ),
          },
    [secretNames]
  );

  const secretResource = createSecretResource(namespace);
  return useMockableQuery<IKubeList<ISecret>>(
    {
      queryKey: ['secrets', secretNames],
      queryFn: async () => await consoleFetchJSON(secretResource.listPath()),
      refetchInterval: usePollingContext().refetchInterval,
      enabled: !!secretNames && secretNames.length > 0,
      select: filterList,
    },
    mockKubeList([MOCK_SECRET_SECURE, MOCK_SECRET_INSECURE], 'SecretList')
  );
};

export const useSecretsForProvidersQuery = (
  providersQuery: UseQueryResult<IKubeList<IProviderObject>>,
  namespace: string
): UseQueryResult<IKubeList<ISecret>> => {
  const providerSecretNames: string[] = useMemo(
    () =>
      providersQuery.data?.items
        ?.map((provider) => provider.spec?.secret?.name ?? '')
        .filter(Boolean) ?? [],
    [providersQuery.data]
  );

  return useSecretsQuery(providerSecretNames, namespace);
};
