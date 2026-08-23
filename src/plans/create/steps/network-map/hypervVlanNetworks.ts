import type {
  OpenShiftNetworkAttachmentDefinition,
  ProviderVirtualMachine,
} from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { MappingValue } from '@utils/types';

import type { ProviderNetwork } from '../../types';

type HypervNic = { network?: { id?: string }; vlanId?: number };
type HypervVmWithNics = ProviderVirtualMachine & { nics?: HypervNic[] };

const collectDistinctVlansByNetwork = (nics: HypervNic[]): Map<string, Set<number>> => {
  const vlansByNetwork = new Map<string, Set<number>>();
  for (const nic of nics) {
    const netId = nic.network?.id;
    if (netId) {
      const set = vlansByNetwork.get(netId) ?? new Set<number>();
      set.add(nic.vlanId ?? 0);
      vlansByNetwork.set(netId, set);
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
  if (vlanEntries.has(key)) {
    return;
  }
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
      const networkId = nic.network?.id ?? '';
      const networkName = networkNameById.get(networkId) ?? networkId;
      upsertVlanEntry(vlanEntries, networkId, networkName, nic.vlanId ?? 0);
    }
  }

  return Array.from(vlanEntries.values());
};
