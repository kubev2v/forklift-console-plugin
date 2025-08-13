import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks.ts';
import { MULTUS, POD } from 'src/plans/details/utils/constants.ts';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
} from '@kubev2v/types';

export const convertInventoryNetworkToV1beta1NetworkMapSpecMapSource = (
  inventoryNetwork: InventoryNetwork,
): V1beta1NetworkMapSpecMapSource => {
  if (inventoryNetwork?.id === 'pod') {
    return { type: POD };
  }

  return {
    id: inventoryNetwork?.id,
    name: inventoryNetwork.name,
    namespace: inventoryNetwork.namespace,
  };
};

export const openShiftNetworkAttachmentDefinitionToName = (
  net: OpenShiftNetworkAttachmentDefinition,
) => (net?.namespace ? `${net?.namespace}/${net?.name}` : (net?.name ?? 'Pod'));

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

  return net ? openShiftNetworkAttachmentDefinitionToName(net) : 'Pod';
};

export const convertOpenShiftNetworkAttachmentDefinitionToV1beta1NetworkMapSpecMapDestination = (
  networkAttachmentDefinition?: OpenShiftNetworkAttachmentDefinition,
): V1beta1NetworkMapSpecMapDestination => {
  if (!networkAttachmentDefinition) {
    return { type: POD };
  }

  return {
    name: networkAttachmentDefinition.name,
    namespace: networkAttachmentDefinition.namespace,
    type: networkAttachmentDefinition.type ?? MULTUS,
  };
};

export const isNetMapped = (networkMapID: string, networkMap: V1beta1NetworkMap | null) => {
  return (
    networkMap?.spec?.map.find((networkMapSpec) => networkMapID === networkMapSpec?.source?.id) !==
    undefined
  );
};
