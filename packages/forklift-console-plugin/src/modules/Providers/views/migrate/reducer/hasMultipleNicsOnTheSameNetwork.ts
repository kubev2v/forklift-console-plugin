import { OVirtNicProfile } from '@kubev2v/types';

import { VmData } from '../../details';

import { toNetworks } from './getNetworksUsedBySelectedVMs';

/**
 * Special case of multiplePodNetworkMappings condition.
 * If multiple NICs are on the same (source) network then resulting mapping may be invalid.
 * Note for oVirt: if NIC profiles are missing then the validation is based only on NIC profile IDs.
 * However such check is incomplete: it may happen that different profiles resolve to the same network.
 * @link https://github.com/kubev2v/forklift/blob/3673837fdedd0ab92df11bce00c31f116abbc126/pkg/controller/plan/validation.go#L363
 */
export const hasMultipleNicsOnTheSameNetwork = (
  selectedVms: VmData[],
  nicProfiles?: OVirtNicProfile[],
): boolean =>
  selectedVms
    .map(({ vm }) => toNetworks(vm, nicProfiles))
    // filter out invalid networks
    .map((networks) => networks.filter(Boolean))
    .some((networks) => networks.length !== new Set(networks).size);
