import type { NetworkMapping } from 'src/networkMaps/utils/types';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import type { InventoryNetwork } from 'src/utils/hooks/useNetworks';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1NetworkMapSpecMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
  V1beta1Provider,
} from '@forklift-ui/types';
import { DEFAULT_NETWORK, IGNORED, MULTUS, POD } from '@utils/constants';
import type { MappingValue } from '@utils/types';

const getDestination = (targetNetwork: MappingValue): V1beta1NetworkMapSpecMapDestination => {
  const isPodNetwork = targetNetwork.name === DEFAULT_NETWORK;
  const isIgnoreNetwork = targetNetwork.name === IgnoreNetwork.Label;

  if (isPodNetwork) {
    return { type: POD };
  }

  if (isIgnoreNetwork) {
    return { type: IgnoreNetwork.Type };
  }

  return {
    name: targetNetwork.name,
    namespace: targetNetwork.id,
    type: MULTUS,
  };
};
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
    const destination = getDestination(targetNetwork);

    if (isOpenShiftProvider) {
      const isPodSourceNetwork = sourceNetwork.name === DEFAULT_NETWORK;
      const source: V1beta1NetworkMapSpecMapSource = isPodSourceNetwork
        ? { type: POD }
        : { name: sourceNetwork.name.replace(/^\//gu, '') };
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination,
        source,
      };
      acc.push(baseMapping);
    }

    if (!isOpenShiftProvider) {
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination,
        source: {
          id: sourceNetwork.id,
          name: sourceNetwork.name,
        },
      };
      acc.push(baseMapping);
    }

    return acc;
  }, []);
};

const openShiftNetworkAttachmentDefinitionToName = (net: OpenShiftNetworkAttachmentDefinition) =>
  net?.namespace ? `${net?.namespace}/${net?.name}` : (net?.name ?? DEFAULT_NETWORK);

const getSourceNetName = (source: V1beta1NetworkMapSpecMapSource, isOpenShiftProvider: boolean) => {
  if (isOpenShiftProvider && source?.type === POD) {
    return DEFAULT_NETWORK;
  }

  return source?.name ?? source?.id ?? '';
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

export const getMappingValues = (
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

    const sourceNetwork: MappingValue = {
      id: isOpenShiftProvider
        ? (sourceNetworks.find((net) => net.name === sourceNet.name)?.id ?? '')
        : (sourceNet.id ?? ''),
      name: getSourceNetName(sourceNet, isOpenShiftProvider),
    };

    const targetNetwork: MappingValue = {
      id: destNet.namespace ?? '',
      name: getDestinationNetName(destinationNetworks, destNet),
    };

    return {
      sourceNetwork,
      targetNetwork,
    };
  });
};
