import { useMemo } from 'react';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';
import { useOpenShiftNetworks } from 'src/utils/hooks/useNetworks';

import type { V1beta1Provider } from '@forklift-ui/types';
import { POD } from '@utils/constants';
import { DEFAULT_NETWORK } from '@utils/constants';

type TargetNetwork = {
  id: string;
  name: string;
  isPodNetwork: boolean;
};

const useTargetNetworks = (
  targetProvider: V1beta1Provider | undefined,
  targetProject: string | undefined,
): [TargetNetwork[], boolean, Error | null] => {
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);

  const targetNetworks = useMemo(() => {
    const networksList: TargetNetwork[] = [
      {
        id: POD,
        isPodNetwork: true,
        name: DEFAULT_NETWORK,
      },
      {
        id: IgnoreNetwork.Type,
        isPodNetwork: false,
        name: IgnoreNetwork.Label,
      },
    ];

    // Add other networks from the target provider that are in the target project
    availableTargetNetworks?.forEach((network) => {
      if (network.namespace === targetProject) {
        networksList.push({
          id: network.uid,
          isPodNetwork: false,
          name: network.name,
        });
      }
    });

    return networksList;
  }, [availableTargetNetworks, targetProject]);

  return [targetNetworks, targetNetworksLoading, targetNetworksError];
};

export default useTargetNetworks;
