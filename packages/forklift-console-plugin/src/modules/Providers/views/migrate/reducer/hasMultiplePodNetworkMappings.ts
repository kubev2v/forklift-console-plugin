import { OVirtNicProfile } from '@kubev2v/types';

import { VmData } from '../../details';
import { Mapping } from '../types';

import { POD_NETWORK } from './actions';
import { toNetworks } from './getNetworksUsedBySelectedVMs';

/**
 * Equivalent of multiplePodNetworkMappings condition.
 * @link https://github.com/kubev2v/forklift/blob/3673837fdedd0ab92df11bce00c31f116abbc126/pkg/controller/plan/validation.go#L363
 */
export const hasMultiplePodNetworkMappings = (
  mappings: Mapping[],
  selectedVMs: VmData[],
  sourceNetworkLabelToId: { [label: string]: string },
  nicProfiles?: OVirtNicProfile[],
) => {
  const netIdsMappedToPodNet = new Set(
    mappings
      ?.filter(({ destination }) => destination === POD_NETWORK)
      ?.map(({ source }) => sourceNetworkLabelToId[source]) ?? [],
  );
  return selectedVMs
    .map(({ vm }) => toNetworks(vm, nicProfiles))
    .some((networks) => networks.filter((id) => netIdsMappedToPodNet.has(id)).length >= 2);
};
