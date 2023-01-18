import { createSecretResource } from '@app/client/helpers';
import { usePollingContext } from '@app/common/context';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { UseQueryResult } from 'react-query';
import { useMockableQuery } from './helpers';
import { MOCK_SECRET } from './mocks/secrets.mock';
import { ISecret } from './types';

export const useSecretQuery = (
  secretName: string | null,
  namespace: string
): UseQueryResult<ISecret> => {
  const secretResource = createSecretResource(namespace);
  return useMockableQuery<ISecret>(
    {
      queryKey: ['secrets', secretName],
      queryFn: async () => await consoleFetchJSON(secretResource.namedPath(secretName)),
      refetchInterval: usePollingContext().refetchInterval,
      enabled: !!secretName,
    },
    MOCK_SECRET
  );
};
