import { usePollingContext } from 'legacy/src/common/context';
import { UseQueryResult } from 'react-query';
import { getInventoryApiUrl, useMockableQuery } from './helpers';
import { SourceInventoryProvider } from './types';
import { MOCK_NIC_PROFILES } from 'legacy/src/queries/mocks/nicProfiles.mock';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export interface INicProfile {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  // properties available with ?detail=1
  network: string; // the network id
}

export const useNicProfilesQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<INicProfile[]> => {
  return useMockableQuery<INicProfile[], unknown>(
    {
      queryKey: ['nicProfiles', provider?.selfLink],
      queryFn: async () =>
        await consoleFetchJSON(
          getInventoryApiUrl(`${provider?.selfLink || ''}/nicprofiles?detail=1`)
        ),
      enabled: !!provider && provider.type === 'ovirt',
      refetchInterval: usePollingContext().refetchInterval,
    },
    MOCK_NIC_PROFILES
  );
};
