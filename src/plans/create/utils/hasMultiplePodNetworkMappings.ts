import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { DefaultNetworkLabel } from '@utils/mappings/constants';
import type { NetworkMapping } from '@utils/mappings/networkMap';

import { getVMNetworksOrProfiles } from './getVMNetworksOrProfiles';

export const hasMultiplePodNetworkMappings = (
  networkMap: NetworkMapping[],
  vms: Record<string, ProviderVirtualMachine>,
  oVirtNicProfiles: OVirtNicProfile[],
) => {
  const netIdsMappedToPodNet = new Set(
    networkMap
      ?.filter(({ targetNetwork }) => targetNetwork?.name === DefaultNetworkLabel.Source)
      ?.map(({ sourceNetwork }) => sourceNetwork?.id) ?? [],
  );

  return Object.values(vms).some((vm) => {
    const networks = getVMNetworksOrProfiles(vm, oVirtNicProfiles);
    if (!networks || !Array.isArray(networks)) return false;

    const uniqueNetworks = networks.filter((value, index, array) => array.indexOf(value) === index);
    const mappedNetworks = uniqueNetworks.filter((id) => netIdsMappedToPodNet.has(id as string));

    return mappedNetworks.length >= 2;
  });
};

export const hasPodNetworkMappings = (networkMap: NetworkMapping[]) => {
  return networkMap.some(({ targetNetwork }) => targetNetwork?.name === DefaultNetworkLabel.Source);
};
