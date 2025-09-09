import { toNetworks } from 'src/modules/Providers/views/migrate/reducer/getNetworksUsedBySelectedVMs';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OVirtNicProfile,
  OVirtVM,
  ProviderVirtualMachine,
} from '@kubev2v/types';
import { Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import type { CategorizedSourceMappings, MappingValue, ProviderNetwork } from '../../types';
import { hasMultiplePodNetworkMappings } from '../../utils/hasMultiplePodNetworkMappings';
import { getMapResourceLabel } from '../utils';

import { defaultNetMapping, NetworkMapFieldId, type NetworkMapping } from './constants';

type NetworkMappingId = `${NetworkMapFieldId.NetworkMap}.${number}.${keyof NetworkMapping}`;

type ValidateNetworkMapParams = {
  values: NetworkMapping[];
  usedSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
  oVirtNicProfiles: OVirtNicProfile[];
};

/**
 * Creates a field ID for a network mapping at a specific index
 * Used for form field identification and validation
 */
export const getNetworkMapFieldId = (id: keyof NetworkMapping, index: number): NetworkMappingId =>
  `${NetworkMapFieldId.NetworkMap}.${index}.${id}`;

/**
 * Creates a mapping from NIC profile IDs to network IDs
 */
const createNicProfileToNetworkMap = (
  nicProfiles: OVirtNicProfile[],
  availableNetworks: ProviderNetwork[] = [],
): Map<string, string> => {
  const networkByName = new Map(
    availableNetworks.map((network) => [network.name.toLowerCase(), network.id]),
  );

  return new Map(
    nicProfiles.flatMap((profile) => {
      if (profile.network) {
        return [[profile.id, profile.network]];
      }

      const networkId = networkByName.get(profile.name.toLowerCase());
      return networkId ? [[profile.id, networkId]] : [];
    }),
  );
};

/**
 * Extracts network IDs from oVirt VMs using NIC profile mapping
 */
const getOvirtNetworkIds = (vm: OVirtVM, nicProfileToNetworkMap: Map<string, string>): string[] => {
  return (
    vm.nics?.reduce<string[]>((acc, nic) => {
      const networkId = nicProfileToNetworkMap.get(nic.profile);
      const id = networkId ?? nic.profile;

      return id ? [...acc, id] : acc;
    }, []) ?? []
  );
};

/**
 * Extracts all unique network IDs used by the provided VMs
 * For oVirt, uses NIC profiles to map NIC profile IDs to network IDs
 */
const getNetworksUsedByProviderVms = (
  providerVms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[] = [],
  availableNetworks: ProviderNetwork[] = [],
): string[] => {
  const nicProfileToNetworkMap = createNicProfileToNetworkMap(nicProfiles, availableNetworks);

  const networkIdSet = providerVms.reduce<Set<string>>((acc, vm) => {
    const networkIds =
      vm.providerType === PROVIDER_TYPES.ovirt
        ? getOvirtNetworkIds(vm, nicProfileToNetworkMap)
        : toNetworks(vm, nicProfiles);

    // Add network IDs to the set
    networkIds.forEach((id) => acc.add(id));
    return acc;
  }, new Set());

  return Array.from(networkIdSet);
};

/**
 * Categorizes available source networks into 'used' and 'other' based on VM usage
 * This helps prioritize networks that need mapping in the UI
 */
export const getSourceNetworkValues = (
  availableSourceNetworks: ProviderNetwork[],
  vms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[],
): CategorizedSourceMappings => {
  const usedNetworkIds = new Set(
    getNetworksUsedByProviderVms(vms, nicProfiles, availableSourceNetworks),
  );

  const used: MappingValue[] = [];
  const other: MappingValue[] = [];

  for (const network of availableSourceNetworks) {
    const mappingValue = {
      id: network.id,
      name: getMapResourceLabel(network),
    };

    if (usedNetworkIds.has(network.id)) {
      used.push(mappingValue);
    } else {
      other.push(mappingValue);
    }
  }

  return { other, used };
};

/**
 * Validates that all detected networks have corresponding mappings and that no vm with 2 nics are both
 * mapped to pod networking.
 *
 * @param values - Network mappings configured by user
 * @param usedSourceNetworks - Networks that need to be mapped
 * @returns Error message if mapping is not valid, undefined otherwise
 */
export const validateNetworkMap = (validateNetworkMapParams: ValidateNetworkMapParams) => {
  const { oVirtNicProfiles, usedSourceNetworks, values, vms } = validateNetworkMapParams;
  const mappedNetworkNames = new Set(
    values.map((value) => value[NetworkMapFieldId.SourceNetwork].name),
  );
  const hasUnmappedNetwork = !usedSourceNetworks.every((sourceNetwork) =>
    mappedNetworkNames.has(sourceNetwork.name),
  );
  if (hasUnmappedNetwork) return t('All networks detected on the selected VMs require a mapping.');

  const hasMultiplePodNetwork = hasMultiplePodNetworkMappings(values, vms, oVirtNicProfiles);
  if (hasMultiplePodNetwork)
    return t(
      'At least one VM is detected with more than one interface mapped to Default Network. This is not allowed.',
    );

  return undefined;
};

/**
 * Filters target networks by project/namespace and transforms to mapping object
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
      const isValidNamespace =
        network.namespace === targetProject || network.namespace === Namespace.Default;

      if (isValidNamespace) {
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
