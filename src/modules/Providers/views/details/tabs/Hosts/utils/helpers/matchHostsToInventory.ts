import type {
  NetworkAdapters,
  V1beta1Host,
  V1beta1Provider,
  VSphereHost,
  VSphereHostInventory,
} from '@kubev2v/types';

/**
 * Type to represent a pair of ProviderHost, V1beta1Host and NetworkAdapters.
 */
export type InventoryHostPair = {
  inventory: VSphereHost;
  host?: V1beta1Host;
  networkAdapter?: NetworkAdapters;
};

/**
 * Function that matches ProviderHost items to V1beta1Host and NetworkAdapters items based on the id and ipAddress properties respectively.
 * @param inventories - An array of ProviderHost objects.
 * @param hosts - An array of V1beta1Host objects.
 * @returns An array of InventoryHostPair objects where each object is a pair of ProviderHost, matching V1beta1Host and NetworkAdapters.
 */
export const matchHostsToInventory = (
  inventories: VSphereHostInventory[],
  hosts: V1beta1Host[],
  provider: V1beta1Provider,
): InventoryHostPair[] => {
  // Sanity tests
  if (!inventories || inventories.length === 0) {
    return [];
  }

  // Convert the list of hosts to a map for faster lookup
  const hostMap = new Map<string, V1beta1Host>();
  for (const host of hosts) {
    if (
      host.spec?.id &&
      host.spec?.provider?.name === provider.metadata?.name &&
      host.spec?.provider?.namespace === provider.metadata?.namespace
    ) {
      hostMap.set(host.spec.id, host);
    }
  }

  // Now iterate through the inventories and try to find a matching host and network adapter for each
  return inventories.map((inventory) => {
    const host = hostMap.get(inventory.id);
    let networkAdapter: NetworkAdapters | undefined;
    if (host?.spec?.ipAddress && inventory.networkAdapters) {
      networkAdapter = inventory.networkAdapters.find(
        (adapter) => adapter.ipAddress === host.spec?.ipAddress,
      );
    }
    return { host, inventory, networkAdapter };
  });
};
