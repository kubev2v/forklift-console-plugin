import type { MappingValue } from '@utils/types';

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
