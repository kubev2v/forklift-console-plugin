import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import { toNetworks } from 'src/modules/Providers/views/migrate/reducer/getNetworksUsedBySelectedVMs';
import { mapSourceNetworksToLabels } from 'src/modules/Providers/views/migrate/reducer/mapSourceToLabels';

import type { OVirtNicProfile, ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';

import { NetworkMapFieldId, type NetworkMapping } from './constants';

type NetworkMappingId = `${NetworkMapFieldId.NetworkMappings}.${number}.${keyof NetworkMapping}`;

export const getNetworkMapFieldId = (id: keyof NetworkMapping, index: number): NetworkMappingId =>
  `${NetworkMapFieldId.NetworkMappings}.${index}.${id}`;

const getNetworksUsedByProviderVms = (
  providerVms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[],
): string[] => {
  return Array.from(new Set(providerVms.flatMap((vm) => toNetworks(vm, nicProfiles))));
};

type SourceProviderNetworks = { used: string[]; other: string[] };

export const getSourceNetworkLabels = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceNetworks: InventoryNetwork[],
  vms: ProviderVirtualMachine[],
): SourceProviderNetworks => {
  const networkIdsUsedBySelectedVms =
    sourceProvider?.spec?.type === 'ovirt' ? [] : getNetworksUsedByProviderVms(vms, []);
  const sourceNetworkLabelMap = mapSourceNetworksToLabels(availableSourceNetworks);

  return Object.entries(sourceNetworkLabelMap).reduce(
    (acc: SourceProviderNetworks, [networkLabel]) => {
      const hasNetworksUsedByVms = networkIdsUsedBySelectedVms.some(
        (id) => id === sourceNetworkLabelMap[networkLabel] || id === networkLabel,
      );

      if (hasNetworksUsedByVms) {
        acc.used.push(networkLabel);
      } else {
        acc.other.push(networkLabel);
      }

      return acc;
    },
    {
      other: [],
      used: [],
    },
  );
};
