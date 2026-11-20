import { getMultiNicSourceNetworks } from '@components/mappings/network-mappings/utils/getMultiNicSourceNetworks';
import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import type { MappingValue } from '@utils/types';

type PlanNetworkMapDerivedParams = {
  otherSourceNetworks: MappingValue[];
  oVirtNicProfiles: OVirtNicProfile[];
  usedSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
};

type PlanNetworkMapDerivedResult = {
  multiNicNetworkIds: Set<string>;
  networkNames: Map<string, string>;
  vmsList: ProviderVirtualMachine[];
};

export const getPlanNetworkMapDerived = ({
  otherSourceNetworks,
  oVirtNicProfiles,
  usedSourceNetworks,
  vms,
}: PlanNetworkMapDerivedParams): PlanNetworkMapDerivedResult => {
  const vmsList = Object.values(vms);
  const networkNames = new Map(
    [...usedSourceNetworks, ...otherSourceNetworks]
      .filter((net) => net.id && net.name)
      .map((net) => [net.id ?? '', net.name]),
  );
  const multiNicNetworkIds = new Set(getMultiNicSourceNetworks(vmsList, oVirtNicProfiles).keys());

  return { multiNicNetworkIds, networkNames, vmsList };
};
