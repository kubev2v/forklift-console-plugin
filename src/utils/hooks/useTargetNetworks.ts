import { useMemo } from 'react';
import { useOpenShiftNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { POD } from 'src/plans/details/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';
import { DEFAULT_NETWORK } from '@utils/constants';

export type TargetNetwork = {
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
    const networksList: TargetNetwork[] = [];

    networksList.push({
      id: POD,
      isPodNetwork: true,
      name: DEFAULT_NETWORK,
    });

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
