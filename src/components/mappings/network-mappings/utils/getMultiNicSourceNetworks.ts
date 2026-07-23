import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

export type MultiNicNetwork = { maxNicCount: number; name: string };

type VmWithNics = ProviderVirtualMachine & {
  nics?: { network?: { id?: string }; profile?: string }[];
};

/**
 * Extracts all network IDs for a VM's NICs WITHOUT deduplication.
 * Returns one entry per NIC, preserving duplicates when multiple NICs
 * share the same source network.
 *
 * For vSphere and Hyper-V, uses the `nics` array (one entry per NIC)
 * rather than the `networks` array (which is deduplicated by the backend
 * and only lists unique networks).
 */
const getVmNicNetworkIds = (
  vm: ProviderVirtualMachine,
  nicProfiles?: OVirtNicProfile[],
): string[] => {
  if (vm.providerType === (PROVIDER_TYPES.nutanix as string)) {
    return (
      (vm as ProviderVirtualMachine & { nics?: { subnetUuid?: string }[] })?.nics
        ?.map((nic) => nic?.subnetUuid)
        .filter((id): id is string => Boolean(id)) ?? []
    );
  }

  switch (vm.providerType) {
    case PROVIDER_TYPES.vsphere:
    case PROVIDER_TYPES.hyperv:
      return (
        (vm as VmWithNics)?.nics
          ?.map((nic) => nic?.network?.id)
          .filter((id): id is string => Boolean(id)) ?? []
      );
    case PROVIDER_TYPES.ovirt:
      return (
        vm?.nics?.map((nic) => {
          const profileNetwork = nicProfiles?.find(
            (profile) => profile?.id === nic?.profile,
          )?.network;
          return profileNetwork ?? nic?.profile;
        }) ?? []
      ).filter((id): id is string => Boolean(id));
    case PROVIDER_TYPES.openstack:
    case PROVIDER_TYPES.openshift:
    case PROVIDER_TYPES.ova:
      // These providers either can't have duplicate NICs on the same network
      // (OpenStack uses a map keyed by network name) or use a different data
      // model (OCP, OVA). EC2 is excluded because same-subnet multi-ENI is
      // uncommon and the provider uses a separate code path.
      return [];
    default:
      return [];
  }
};

/**
 * Detects source networks where at least one VM has multiple NICs attached.
 * Returns only networks with max NIC count > 1 across all provided VMs.
 *
 * Used by the UI to show an informational alert guiding users to add
 * additional network mapping rows for the backend's NAD Pool feature
 * (MTV-5511).
 */
export const getMultiNicSourceNetworks = (
  vms: ProviderVirtualMachine[],
  nicProfiles?: OVirtNicProfile[],
): Map<string, MultiNicNetwork> => {
  const maxNicCountByNetwork = new Map<string, number>();

  for (const vm of vms) {
    const nicNetworkIds = getVmNicNetworkIds(vm, nicProfiles);

    const nicCountPerNetwork = new Map<string, number>();
    for (const networkId of nicNetworkIds) {
      nicCountPerNetwork.set(networkId, (nicCountPerNetwork.get(networkId) ?? 0) + 1);
    }

    for (const [networkId, count] of nicCountPerNetwork) {
      const currentMax = maxNicCountByNetwork.get(networkId) ?? 0;
      if (count > currentMax) {
        maxNicCountByNetwork.set(networkId, count);
      }
    }
  }

  const result = new Map<string, MultiNicNetwork>();
  for (const [networkId, maxCount] of maxNicCountByNetwork) {
    if (maxCount > 1) {
      result.set(networkId, { maxNicCount: maxCount, name: networkId });
    }
  }

  return result;
};
