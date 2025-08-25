import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks.ts';
import { MULTUS, POD } from 'src/plans/details/utils/constants.ts';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
} from '@kubev2v/types';
import { DEFAULT_NETWORK } from '@utils/constants';

export const convertInventoryNetworkToSource = (
  inventoryNetwork: InventoryNetwork,
): V1beta1NetworkMapSpecMapSource => {
  if (inventoryNetwork?.id === POD) {
    return { type: POD };
  }

  return {
    id: inventoryNetwork?.id,
    name: inventoryNetwork?.name,
    namespace: 'namespace' in inventoryNetwork ? inventoryNetwork?.namespace : undefined,
    type: inventoryNetwork?.providerType,
  };
};

export const openShiftNetworkAttachmentDefinitionToName = (
  net: OpenShiftNetworkAttachmentDefinition,
) => (net?.namespace ? `${net?.namespace}/${net?.name}` : (net?.name ?? DEFAULT_NETWORK));

export const getSourceNetName = (
  networks: InventoryNetwork[],
  source: V1beta1NetworkMapSpecMapSource,
) => {
  const net = networks.find(
    (network) => network?.id === source?.id || network?.name === source?.name,
  );

  return net?.name ?? source?.name ?? source?.id;
};

export const getDestinationNetName = (
  networks: OpenShiftNetworkAttachmentDefinition[],
  destination: V1beta1NetworkMapSpecMapDestination,
) => {
  const net = networks.find(
    (network) =>
      network?.name === destination?.name && network?.namespace === destination?.namespace,
  );

  return net ? openShiftNetworkAttachmentDefinitionToName(net) : DEFAULT_NETWORK;
};

export const convertNetworkToDestination = (
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
