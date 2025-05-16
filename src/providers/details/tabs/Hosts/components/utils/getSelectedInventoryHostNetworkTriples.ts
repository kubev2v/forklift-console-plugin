import type { InventoryHostNetworkTriple } from './types';

export const getSelectedInventoryHostNetworkTriples = (
  data: InventoryHostNetworkTriple[],
  selectedIds: string[],
): InventoryHostNetworkTriple[] =>
  data
    .filter((pair) => selectedIds.includes(pair.inventory.id))
    .sort((a, b) => a.inventory.name.localeCompare(b.inventory.name));
