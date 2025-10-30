import type { MapsSectionState } from 'src/modules/NetworkMaps/views/details/components/MapsSection/state/reducer';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { Mapping } from 'src/modules/Providers/views/migrate/types';
import { IgnoreNetwork } from 'src/plans/details/tabs/Mappings/utils/constants';
import { IGNORED, MULTUS, POD } from 'src/plans/details/utils/constants';
import { isMapDestinationTypeSupported } from 'src/plans/details/utils/utils';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
} from '@kubev2v/types';
import { DEFAULT_NETWORK } from '@utils/constants';

export const convertInventoryNetworkToSource = (
  inventoryNetwork: InventoryNetwork | { id: string; name?: string; providerType?: string },
): V1beta1NetworkMapSpecMapSource => {
  if (inventoryNetwork.id === POD) {
    return { type: POD };
  }

  return {
    id: inventoryNetwork?.id,
    name: inventoryNetwork?.name,
    namespace: 'namespace' in inventoryNetwork ? inventoryNetwork?.namespace : undefined,
    type: inventoryNetwork?.providerType,
  };
};

const openShiftNetworkAttachmentDefinitionToName = (net: OpenShiftNetworkAttachmentDefinition) =>
  net?.namespace ? `${net?.namespace}/${net?.name}` : (net?.name ?? DEFAULT_NETWORK);

const getSourceNetName = (networks: InventoryNetwork[], source: V1beta1NetworkMapSpecMapSource) => {
  const net = networks.find(
    (network) => network?.id === source?.id || network?.name === source?.name,
  );

  return net?.name ?? source?.name ?? source?.id;
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

const convertNetworkToDestination = (
  networkAttachmentDefinition?: OpenShiftNetworkAttachmentDefinition,
): V1beta1NetworkMapSpecMapDestination => {
  if (!networkAttachmentDefinition) {
    return { type: POD };
  }

  return {
    name: networkAttachmentDefinition.name,
    namespace: networkAttachmentDefinition.namespace,
    type: MULTUS,
  };
};

export const isNetMapped = (networkMapID: string, networkMap: V1beta1NetworkMap | null) => {
  return (
    networkMap?.spec?.map.find((networkMapSpec) => networkMapID === networkMapSpec?.source?.id) !==
    undefined
  );
};

export const getMappings = (
  state: MapsSectionState,
  sourceNetworks: InventoryNetwork[],
  destinationNetworks: OpenShiftNetworkAttachmentDefinition[],
  duplicateNetworkNames: Set<string>,
) => {
  return (
    state.networkMap?.spec?.map.map((networkMapSpec) => {
      const sourceName =
        networkMapSpec.source?.type === POD
          ? DEFAULT_NETWORK
          : (getSourceNetName(sourceNetworks, networkMapSpec.source) ?? '');

      // Add ID to source name if it's a duplicate, to match the sources labels
      const sourceWithId =
        sourceName !== DEFAULT_NETWORK && duplicateNetworkNames.has(sourceName)
          ? `${sourceName} (${networkMapSpec.source?.id ?? ''})`
          : sourceName;

      return {
        destination: getDestinationNetName(destinationNetworks, networkMapSpec.destination),
        source: sourceWithId,
      };
    }) ?? []
  );
};

export const getCurrentSourceNet = (current: Mapping, sourceNetworks: InventoryNetwork[]) => {
  const sourceName = current.source.replace(/ \([^)]+\)$/u, '');

  if (sourceName === DEFAULT_NETWORK) {
    return { id: POD };
  }

  return sourceNetworks.find((network) => network?.name === sourceName) ?? { id: POD };
};

export const getCurrentDestinationNet = (
  current: Mapping,
  destinationNetworks: OpenShiftNetworkAttachmentDefinition[],
) => {
  const net = destinationNetworks.find(
    (network) => openShiftNetworkAttachmentDefinitionToName(network) === current.destination,
  );

  if (net) {
    return { ...net, type: '' };
  }

  if (current.destination === IgnoreNetwork.Label) {
    return { type: IGNORED };
  }

  return { name: DEFAULT_NETWORK, type: POD };
};

export const getReplacePayload = (
  state: MapsSectionState,
  current: Mapping,
  next: Mapping,
  sourceNetworks: InventoryNetwork[],
  destinationNetworks: OpenShiftNetworkAttachmentDefinition[],
): V1beta1NetworkMapSpecMap[] => {
  const currentDestinationNet = getCurrentDestinationNet(current, destinationNetworks);
  const currentSourceNet = getCurrentSourceNet(current, sourceNetworks);

  const nextDestinationNet =
    next.destination === DEFAULT_NETWORK || next.destination === IgnoreNetwork.Label
      ? undefined
      : destinationNetworks.find(
          (network) => openShiftNetworkAttachmentDefinitionToName(network) === next.destination,
        );

  // Strip " (id)" suffix from source names with duplicates
  const nextSourceName = next.source.replace(/ \([^)]+\)$/u, '');

  const nextSourceNet =
    nextSourceName === DEFAULT_NETWORK
      ? { id: POD }
      : sourceNetworks.find((network) => network?.name === nextSourceName);

  if (!nextSourceNet) {
    return [];
  }

  const getDestination = (): V1beta1NetworkMapSpecMapDestination => {
    if (next.destination === IgnoreNetwork.Label) {
      return { type: IGNORED };
    }

    if (next.destination === DEFAULT_NETWORK) {
      return { type: POD };
    }

    return convertNetworkToDestination(nextDestinationNet);
  };

  const nextMap: V1beta1NetworkMapSpecMap = {
    destination: getDestination(),
    source: convertInventoryNetworkToSource(nextSourceNet),
  };

  return (
    state?.networkMap?.spec?.map?.map((map) => {
      const sourceMatches =
        map?.source?.id === currentSourceNet?.id || map.source?.type === currentSourceNet?.id;

      const destinationMatches =
        map.destination?.name === currentDestinationNet?.name ||
        (map.destination?.type === currentDestinationNet?.type &&
          isMapDestinationTypeSupported(map.destination?.type));

      return sourceMatches && destinationMatches ? nextMap : map;
    }) ?? []
  );
};
