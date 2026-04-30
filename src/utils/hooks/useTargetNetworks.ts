import { useMemo } from 'react';
import { useOpenShiftNetworks } from 'src/utils/hooks/useNetworks';

import type { V1beta1Provider } from '@forklift-ui/types';
import { DEFAULT_NETWORK, POD } from '@utils/constants';
import type { MappingValue } from '@utils/types';

const useTargetNetworks = (
  targetProvider: V1beta1Provider | undefined,
): [MappingValue[], boolean, Error | null] => {
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);

  const targetNetworks = useMemo(() => {
    const networksList: MappingValue[] = [
      {
        id: POD,
        name: DEFAULT_NETWORK,
      },
    ];

    availableTargetNetworks?.forEach((network) => {
      networksList.push({
        id: network.uid,
        name: `${network.namespace}/${network.name}`,
      });
    });

    return networksList;
  }, [availableTargetNetworks]);

  return [targetNetworks, targetNetworksLoading, targetNetworksError];
};

export default useTargetNetworks;
