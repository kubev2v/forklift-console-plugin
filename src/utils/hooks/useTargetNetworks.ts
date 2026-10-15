import { useMemo } from 'react';
import { useOpenShiftNetworks } from 'src/utils/hooks/useNetworks';

import type { V1beta1Provider } from '@forklift-ui/types';
import { POD } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';
import type { MappingValue } from '@utils/types';

const useTargetNetworks = (
  targetProvider: V1beta1Provider | undefined,
): [MappingValue[], boolean, Error | null] => {
  const { t } = useForkliftTranslation();
  const defaultNetworkLabel = t('Default network');
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);

  const targetNetworks = useMemo(() => {
    const networksList: MappingValue[] = [{ id: POD, name: defaultNetworkLabel }];

    if (availableTargetNetworks)
      for (const network of availableTargetNetworks) {
        networksList.push({
          id: network.uid,
          name: `${network.namespace}/${network.name}`,
        });
      }

    return networksList;
  }, [availableTargetNetworks, defaultNetworkLabel]);

  return [targetNetworks, targetNetworksLoading, targetNetworksError];
};

export default useTargetNetworks;
