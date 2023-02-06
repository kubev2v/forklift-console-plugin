import { usePollingContext } from 'legacy/src/common/context';
import { UseQueryResult } from 'react-query';
import { getInventoryApiUrl, useMockableQuery } from './helpers';
import { SourceInventoryProvider } from './types';
import { MOCK_DISKS } from 'legacy/src/queries/mocks/disks.mock';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export interface IDisk {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  // properties available with ?detail=1
  storageDomain: string;
}

export const useDisksQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<IDisk[]> => {
  return useMockableQuery<IDisk[], unknown>(
    {
      queryKey: ['disks', provider?.selfLink],
      queryFn: async () =>
        await consoleFetchJSON(getInventoryApiUrl(`${provider?.selfLink || ''}/disks?detail=1`)),
      enabled: !!provider && provider.type === 'ovirt',
      refetchInterval: usePollingContext().refetchInterval,
    },
    MOCK_DISKS
  );
};
