import * as React from 'react';
import { usePollingContext } from 'legacy/src/common/context';
import { getInventoryApiUrl, sortByName, useMockableQuery } from './helpers';
import { IOpenShiftProvider } from './types';
import { IOpenShiftNamespace } from './types/namespaces.types';
import { MOCK_OPENSHIFT_NAMESPACES } from './mocks/namespaces.mock';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export const useNamespacesQuery = (provider: IOpenShiftProvider | null) => {
  const sortByNameCallback = React.useCallback(
    (data): IOpenShiftNamespace[] => sortByName(data),
    []
  );
  const result = useMockableQuery<IOpenShiftNamespace[]>(
    {
      queryKey: ['namespaces', provider?.name],
      queryFn: async () =>
        await consoleFetchJSON(getInventoryApiUrl(`${provider?.selfLink || ''}/namespaces`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
      select: sortByNameCallback,
    },
    MOCK_OPENSHIFT_NAMESPACES
  );
  return result;
};
