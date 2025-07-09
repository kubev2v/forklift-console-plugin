import { PodNetworkLabel } from 'src/plans/details/tabs/Mappings/utils/constants';

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
      ?.filter(({ targetNetwork }) => targetNetwork?.name === PodNetworkLabel.Source)
      ?.map(({ sourceNetwork }) => sourceNetwork?.id) ?? [],
  );

  return Object.values(vms)
    .map((vm) => getVMNetworksOrProfiles(vm, oVirtNicProfiles))
    ?.some(
      (networks) =>
        networks
          .filter((value, index, array) => array.indexOf(value) === index)
          .filter((id) => netIdsMappedToPodNet.has(id as string)).length >= 2,
    );
};
