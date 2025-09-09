import { DefaultNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';

import type { OVirtNicProfile, ProviderVirtualMachine } from '@kubev2v/types';

import type { NetworkMapping } from '../steps/network-map/constants';

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
