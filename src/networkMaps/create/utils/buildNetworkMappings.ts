import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { NetworkMappingValue } from 'src/networkMaps/types';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';
import { IGNORED, MULTUS, POD } from 'src/plans/details/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1NetworkMapSpecMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
  V1beta1Provider,
} from '@kubev2v/types';
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
    const isIgnoreNetwork = targetNetwork.name === IgnoreNetwork.Label;
    let destination: V1beta1NetworkMapSpecMapDestination = {
      name: targetNetwork.name,
      namespace: targetNetwork.id,
      type: MULTUS,
    };

    if (isPodNetwork) {
      destination = { type: POD };
    } else if (isIgnoreNetwork) {
      destination = { type: IgnoreNetwork.Type };
    }

    if (isOpenShiftProvider) {
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination,
        source: {
          name: sourceNetwork.name.replace(/^\//gu, ''),
        },
      };
      acc.push(baseMapping);
    }

    if (!isOpenShiftProvider) {
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination,
        source: {
          id: sourceNetwork.id,
        },
      };
      acc.push(baseMapping);
    }

    return acc;
  }, []);
};

const openShiftNetworkAttachmentDefinitionToName = (net: OpenShiftNetworkAttachmentDefinition) =>
  net?.namespace ? `${net?.namespace}/${net?.name}` : (net?.name ?? DEFAULT_NETWORK);

const getSourceNetName = (networks: InventoryNetwork[], source: V1beta1NetworkMapSpecMapSource) => {
  const net = networks.find(
    (network) => network?.id === source?.id || network?.name === source?.name,
  );

  return net?.name ?? source?.name ?? source?.id ?? '';
};

const getDestinationNetName = (
  networks: OpenShiftNetworkAttachmentDefinition[],
  destination: V1beta1NetworkMapSpecMapDestination,
) => {
  const net = networks.find(
    (network) =>
      network?.name === destination?.name && network?.namespace === destination?.namespace,
  );

  if (net) {
    return openShiftNetworkAttachmentDefinitionToName(net);
  }

  if (destination?.type === IGNORED) {
    return IgnoreNetwork.Label;
  }

  return DEFAULT_NETWORK;
};

export const buildFormNetworkMapping = (
  specMapping: V1beta1NetworkMapSpecMap[] | undefined,
  sourceProvider: V1beta1Provider | undefined,
  sourceNetworks: InventoryNetwork[] = [],
  destinationNetworks: OpenShiftNetworkAttachmentDefinition[] = [],
): NetworkMapping[] => {
  if (!specMapping) {
    return [];
  }

  const isOpenShiftProvider = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;

  return specMapping.map((mapping) => {
    const sourceNet = mapping.source;
    const destNet = mapping.destination;

    const sourceNetwork: NetworkMappingValue = {
      id: isOpenShiftProvider
        ? (sourceNetworks.find((net) => net.name === sourceNet.name)?.id ?? '')
        : (sourceNet.id ?? ''),
      name: getSourceNetName(sourceNetworks, sourceNet),
    };

    const targetNetwork: NetworkMappingValue = {
      id: destNet.namespace ?? '',
      name: getDestinationNetName(destinationNetworks, destNet),
    };

    return {
      sourceNetwork,
      targetNetwork,
    };
  });
};
