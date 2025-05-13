import { toNetworks } from 'src/modules/Providers/views/migrate/reducer/getNetworksUsedBySelectedVMs';

import type { OVirtNicProfile, ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';

import { type CategorizedSourceMappings, type ProviderNetwork, ProviderType } from '../../types';

import { NetworkMapFieldId, type NetworkMapping } from './constants';

type NetworkMappingId = `${NetworkMapFieldId.NetworkMap}.${number}.${keyof NetworkMapping}`;

/**
 * Creates a field ID for a network mapping at a specific index
 * Used for form field identification and validation
 */
export const getNetworkMapFieldId = (id: keyof NetworkMapping, index: number): NetworkMappingId =>
  `${NetworkMapFieldId.NetworkMap}.${index}.${id}`;

/**
 * Extracts all unique network IDs used by the provided VMs
 * Uses the toNetworks utility to handle provider-specific network extraction
 */
const getNetworksUsedByProviderVms = (
  providerVms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[],
): string[] => {
  return Array.from(new Set(providerVms.flatMap((vm) => toNetworks(vm, nicProfiles))));
};

/**
 * Creates a human-readable label for network based on provider type
 * Different providers have different naming conventions
 */
const getNetworkMapLabel = (network: ProviderNetwork): string => {
  switch (network.providerType) {
    case 'openshift': {
      return `${network.namespace}/${network.name}`;
    }
    case 'ova':
    case 'vsphere':
    case 'openstack': {
      return network.name;
    }
    case 'ovirt': {
      // Use path for oVirt if available, otherwise return empty string
      return network.path ?? '';
    }
    default: {
      return '';
    }
  }
};

/**
 * Creates a map of network ID to network object for quick lookups
 */
const getInventoryNetworkMap = (inventoryNetworks: ProviderNetwork[]) =>
  inventoryNetworks.reduce((acc: Record<string, ProviderNetwork>, inventoryNetwork) => {
    acc[inventoryNetwork.id] = inventoryNetwork;
    return acc;
  }, {});

/**
 * Categorizes available source networks into 'used' and 'other' based on VM usage
 * This helps prioritize networks that need mapping in the UI
 */
export const getSourceNetworkValues = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceNetworks: ProviderNetwork[],
  vms: ProviderVirtualMachine[],
): CategorizedSourceMappings => {
  // Skip determining used networks for oVirt as they're handled differently
  const networkIdsUsedBySelectedVms =
    sourceProvider?.spec?.type === ProviderType.Ovirt ? [] : getNetworksUsedByProviderVms(vms, []);

  const sourceNetworkMap = getInventoryNetworkMap(availableSourceNetworks);

  // Categorize networks into 'used' and 'other'
  return Object.entries(sourceNetworkMap).reduce(
    (acc: CategorizedSourceMappings, [sourceNetworkId, sourceNetwork]) => {
      const hasNetworksUsedByVms = networkIdsUsedBySelectedVms.some((id) => id === sourceNetworkId);

      if (hasNetworksUsedByVms) {
        acc.used.push({
          id: sourceNetworkId,
          name: getNetworkMapLabel(sourceNetwork),
        });
      } else {
        acc.other.push({
          id: sourceNetworkId,
          name: getNetworkMapLabel(sourceNetwork),
        });
      }

      return acc;
    },
    {
      other: [],
      used: [],
    },
  );
};
