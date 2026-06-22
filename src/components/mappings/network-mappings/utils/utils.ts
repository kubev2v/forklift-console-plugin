import {
  NetworkMapFieldId,
  type NetworkMapping,
} from 'src/plans/create/steps/network-map/constants';
import type { MappingValue } from 'src/plans/create/types';

/**
 * Compares two source network values accounting for VLAN disambiguation.
 * When either value has a vlan field, both id and vlan must match.
 */
export const isSameSourceNetwork = (a: MappingValue, b: MappingValue): boolean => {
  if (a.vlan || b.vlan) {
    return a.id === b.id && a.vlan === b.vlan;
  }
  return a.id === b.id;
};

export const isNetworkMappingDisabled = (
  networkMappings: NetworkMapping[],
  usedNetwork: MappingValue,
): boolean => {
  return networkMappings?.some((mapping: NetworkMapping) => {
    const source = mapping[NetworkMapFieldId.SourceNetwork];
    return isSameSourceNetwork(source, usedNetwork);
  });
};
