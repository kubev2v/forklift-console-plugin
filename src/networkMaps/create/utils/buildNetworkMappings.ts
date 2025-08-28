import { MULTUS, POD } from 'src/plans/details/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1NetworkMapSpecMap, V1beta1Provider } from '@kubev2v/types';
import { DEFAULT_NETWORK } from '@utils/constants';

import type { NetworkMapping } from '../../constants';

/**
 * Converts network mappings to network map specification mappings
 * Handles different provider types and network configurations
 * @param mappings - Array of network mappings to process
 * @param sourceProvider - Source provider configuration
 * @returns Array of network map specification mappings
 */
export const buildNetworkMappings = (
  mappings: NetworkMapping[],
  sourceProvider: V1beta1Provider | undefined,
): V1beta1NetworkMapSpecMap[] => {
  return mappings?.reduce((acc: V1beta1NetworkMapSpecMap[], mapping) => {
    const { sourceNetwork, targetNetwork } = mapping;

    if (!sourceNetwork.name || !targetNetwork.name) {
      return acc;
    }

    const isOpenShiftProvider = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
    const isPodNetwork = targetNetwork.name === DEFAULT_NETWORK;

    if (isOpenShiftProvider) {
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination: isPodNetwork
          ? { type: POD }
          : { name: targetNetwork.name, namespace: targetNetwork.id, type: MULTUS },
        source: {
          name: sourceNetwork.name.replace(/^\//gu, ''),
        },
      };
      acc.push(baseMapping);
    }

    if (!isOpenShiftProvider) {
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination: isPodNetwork
          ? { type: POD }
          : { name: targetNetwork.name, namespace: targetNetwork.id, type: MULTUS },
        source: {
          id: sourceNetwork.id,
        },
      };
      acc.push(baseMapping);
    }

    return acc;
  }, []);
};
