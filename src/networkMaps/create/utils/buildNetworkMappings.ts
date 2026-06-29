import type { InventoryNetwork } from 'src/utils/hooks/useNetworks';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1NetworkMapSpecMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
  V1beta1Provider,
} from '@forklift-ui/types';
import { DEFAULT_NETWORK, IGNORED, MULTUS, POD } from '@utils/constants';
import type { NetworkMapping } from '@utils/crds/maps/types';
import { IgnoreNetwork } from '@utils/mappings/constants';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { MappingValue } from '@utils/types';

type NetworkMapSource = V1beta1NetworkMapSpecMapSource & { vlan?: string };

const getDestination = (targetNetwork: MappingValue): V1beta1NetworkMapSpecMapDestination => {
  if (targetNetwork.name === DEFAULT_NETWORK) {
    return { type: POD };
  }

  if (targetNetwork.name === IgnoreNetwork.Label) {
    return { type: IgnoreNetwork.Type };
  }

  const slashIndex = targetNetwork.name.indexOf('/');
  const [nadNamespace, nadName] =
    slashIndex === -1
      ? [targetNetwork.id, targetNetwork.name]
      : [targetNetwork.name.substring(0, slashIndex), targetNetwork.name.substring(slashIndex + 1)];

  return {
    name: nadName,
    namespace: nadNamespace,
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
      const source: NetworkMapSource = {
        id: sourceNetwork.id,
        name: sourceNetwork.name,
        ...(sourceNetwork.vlan ? { vlan: sourceNetwork.vlan } : {}),
      };
      const baseMapping: V1beta1NetworkMapSpecMap = {
        destination,
        source,
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
    const { vlan } = sourceNet as NetworkMapSource;

    const sourceNetwork: MappingValue = {
      id: isOpenShiftProvider
        ? (sourceNetworks.find((net) => net.name === sourceNet.name)?.id ?? '')
        : (sourceNet.id ?? ''),
      name: getSourceNetName(sourceNet, isOpenShiftProvider),
      ...(vlan ? { vlan } : {}),
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
