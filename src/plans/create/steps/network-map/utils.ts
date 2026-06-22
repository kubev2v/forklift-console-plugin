import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OVirtNicProfile,
  OVirtVM,
  ProviderVirtualMachine,
} from '@forklift-ui/types';
import { DEFAULT_NETWORK, Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';
import { getEc2SubnetIds, isEc2Vm } from '@utils/types/ec2Inventory';

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

const toNetworksOrProfiles = (vm: ProviderVirtualMachine): string[] => {
  if (isEc2Vm(vm)) return getEc2SubnetIds(vm);

  switch (vm.providerType) {
    case PROVIDER_TYPES.vsphere: {
      return vm?.networks?.map((network) => network?.id) ?? [];
    }
    case PROVIDER_TYPES.openstack: {
      return Object.keys(vm?.addresses ?? {});
    }
    case PROVIDER_TYPES.ovirt: {
      return vm?.nics?.map((nic) => nic?.profile) ?? [];
    }
    case PROVIDER_TYPES.openshift: {
      return (vm?.object?.spec?.template?.spec?.networks ?? []).reduce((acc: string[], network) => {
        const networkName = network?.multus?.networkName ?? network?.name;

        if (network?.pod) {
          acc.push(DEFAULT_NETWORK);
        } else if (networkName) {
          acc.push(networkName);
        }
        return acc;
      }, []);
    }
    case PROVIDER_TYPES.ova: {
      // The OVA backend returns embedded network objects with PascalCase field names (ID),
      // while @forklift-ui/types defines them as camelCase (id). Access ID directly
      // and fall back to id so the code keeps working if the API is ever aligned.
      type RawOvaNet = { ID?: string };
      return (
        vm?.networks
          ?.map((network) => (network as unknown as RawOvaNet).ID ?? network.id)
          .filter((id): id is string => Boolean(id)) ?? []
      );
    }
    case PROVIDER_TYPES.hyperv:
      return vm?.networks?.map((network) => network?.id) ?? [];
    default:
      return [];
  }
};

const toNetworks = (vm: ProviderVirtualMachine, nicProfiles?: OVirtNicProfile[]): string[] => {
  return toNetworksOrProfiles(vm).reduce((acc: string[], network) => {
    const nicProfileNetwork = nicProfiles?.find(
      (nicProfile) => nicProfile?.id === network,
    )?.network;
    if (vm.providerType === 'ovirt' && nicProfileNetwork) {
      acc.push(nicProfileNetwork);
    } else {
      acc.push(network);
    }

    return acc;
  }, []);
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

type HypervNic = { network?: { id?: string }; vlanId?: number };
type HypervVmWithNics = ProviderVirtualMachine & { nics?: HypervNic[] };

const collectDistinctVlansByNetwork = (nics: HypervNic[]): Map<string, Set<number>> => {
  const vlansByNetwork = new Map<string, Set<number>>();
  for (const nic of nics) {
    const netId = nic.network?.id;
    if (netId) {
      if (!vlansByNetwork.has(netId)) vlansByNetwork.set(netId, new Set<number>());
      vlansByNetwork.get(netId)!.add(nic.vlanId ?? 0);
    }
  }
  return vlansByNetwork;
};

const upsertVlanEntry = (
  vlanEntries: Map<string, MappingValue>,
  networkId: string,
  networkName: string,
  vlanId: number,
): void => {
  const key = vlanId === 0 ? `${networkId}/untagged` : `${networkId}/${vlanId}`;
  if (vlanEntries.has(key)) return;
  vlanEntries.set(
    key,
    vlanId === 0
      ? { id: networkId, name: `${networkName} (Untagged)`, vlan: '0' }
      : { id: networkId, name: `${networkName} (VLAN ${vlanId})`, vlan: String(vlanId) },
  );
};

/**
 * For Hyper-V VMs, detects NICs that share the same network but have different VLANs.
 * Returns VLAN-qualified MappingValues for those cases.
 *
 * Disambiguation is scoped to a single VM: only when one VM has multiple NICs on
 * the same network with distinct VLAN IDs are VLAN-qualified entries generated.
 * Cross-VM differences (each VM has a single NIC per network but with different
 * VLANs) do not create mapping conflicts and are handled by the plain network entry.
 */
export const getHypervVlanQualifiedNetworks = (
  vms: ProviderVirtualMachine[],
  availableSourceNetworks: (ProviderNetwork | OpenShiftNetworkAttachmentDefinition)[],
): MappingValue[] => {
  const networkNameById = new Map(availableSourceNetworks.map((net) => [net.id, net.name]));
  const vlanEntries = new Map<string, MappingValue>();

  const hypervVms = vms.filter(
    (vm): vm is HypervVmWithNics =>
      vm.providerType === PROVIDER_TYPES.hyperv && Boolean((vm as HypervVmWithNics).nics),
  );

  for (const vm of hypervVms) {
    const nics = vm.nics ?? [];
    const vlansByNetwork = collectDistinctVlansByNetwork(nics);

    const conflictNics = nics.filter(
      (nic) => nic.network?.id && (vlansByNetwork.get(nic.network.id)?.size ?? 0) > 1,
    );

    for (const nic of conflictNics) {
      const networkId = nic.network!.id!;
      const networkName = networkNameById.get(networkId) ?? networkId;
      upsertVlanEntry(vlanEntries, networkId, networkName, nic.vlanId ?? 0);
    }
  }

  return Array.from(vlanEntries.values());
};

/**
 * Categorizes available source networks into 'used' and 'other' based on VM usage
 * This helps prioritize networks that need mapping in the UI
 */
export const getSourceNetworkValues = (
  availableSourceNetworks: (ProviderNetwork | OpenShiftNetworkAttachmentDefinition)[],
  vms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[],
): CategorizedSourceMappings => {
  const usedNetworkIds = new Set(
    getNetworksUsedByProviderVms(vms, nicProfiles, availableSourceNetworks),
  );

  // For Hyper-V, detect VLAN conflicts and generate VLAN-qualified entries
  const vlanQualified = getHypervVlanQualifiedNetworks(vms, availableSourceNetworks);
  const networksWithVlanConflict = new Set(vlanQualified.map((entry) => entry.id));

  const used: MappingValue[] = [];
  const other: MappingValue[] = [];

  for (const network of availableSourceNetworks) {
    if (networksWithVlanConflict.has(network.id)) {
      // Network replaced by VLAN-qualified entries below
    } else {
      const mappingValue = {
        id: network.id,
        name: network.name === DEFAULT_NETWORK ? DEFAULT_NETWORK : getMapResourceLabel(network),
      };

      if (usedNetworkIds.has(mappingValue.id) || usedNetworkIds.has(mappingValue.name)) {
        used.push(mappingValue);
      } else {
        other.push(mappingValue);
      }
    }
  }

  used.push(...vlanQualified);

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
 * Filters target networks to those allowed by the Plan validation:
 * only NADs in the Plan's target namespace or the `default` namespace.
 *
 * The forklift controller rejects Plans with NADs from other namespaces
 * (NetMapDestinationNADNotValid condition).
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
