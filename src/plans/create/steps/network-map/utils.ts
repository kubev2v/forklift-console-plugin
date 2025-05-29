import { toNetworks } from 'src/modules/Providers/views/migrate/reducer/getNetworksUsedBySelectedVMs';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OVirtNicProfile,
  ProviderVirtualMachine,
  V1beta1Provider,
} from '@kubev2v/types';
import { Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import {
  type CategorizedSourceMappings,
  type MappingValue,
  type ProviderNetwork,
  ProviderType,
} from '../../types';
import { getMapResourceLabel } from '../utils';

import { defaultNetMapping, NetworkMapFieldId, type NetworkMapping } from './constants';

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
          name: getMapResourceLabel(sourceNetwork),
        });
      } else {
        acc.other.push({
          id: sourceNetworkId,
          name: getMapResourceLabel(sourceNetwork),
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

/**
 * Validates network mappings by ensuring all networks detected on source VMs
 * have corresponding mappings in the provided values
 *
 * @param values - Array of network mappings configured by user
 * @param usedSourceNetworks - Array of networks that need to be mapped
 * @returns Error message string if any network is unmapped, undefined if all are mapped
 */
export const validateNetworkMap = (
  values: NetworkMapping[],
  usedSourceNetworks: MappingValue[],
) => {
  if (
    !usedSourceNetworks.every((sourceNetwork) =>
      values.find((value) => value[NetworkMapFieldId.SourceNetwork].name === sourceNetwork.name),
    )
  ) {
    return t('All networks detected on the selected VMs require a mapping.');
  }

  return undefined;
};

/**
 * Filters target networks by project/namespace and transforms them into a mapping object.
 * Only includes networks from the target project or default namespace.
 *
 */
export const filterTargetNetworksByProject = (
  availableTargetNetworks: OpenShiftNetworkAttachmentDefinition[],
  targetProject: string,
) => {
  if (isEmpty(availableTargetNetworks) || !targetProject) {
    return { podNetwork: defaultNetMapping[NetworkMapFieldId.TargetNetwork] };
  }

  return availableTargetNetworks.reduce(
    (networkMap: Record<string, MappingValue>, network) => {
      if (network.namespace === targetProject || network.namespace === Namespace.Default) {
        networkMap[network.uid] = {
          id: network.id,
          name: `${network.namespace}/${network.name}`,
        };
      }

      return networkMap;
    },
    { podNetwork: defaultNetMapping[NetworkMapFieldId.TargetNetwork] },
  );
};
