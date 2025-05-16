import type {
  NetworkAdapters,
  V1beta1Host,
  V1beta1Provider,
  VSphereHostInventory,
} from '@kubev2v/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import type { InventoryHostNetworkTriple } from './types';

export const matchHostsToInventory = (
  inventories: VSphereHostInventory[],
  hosts: V1beta1Host[],
  provider: V1beta1Provider,
): InventoryHostNetworkTriple[] => {
  if (!inventories || inventories.length === 0) {
    return [];
  }

  const hostMap = new Map<string, V1beta1Host>();
  for (const host of hosts) {
    if (
      host.spec?.id &&
      host.spec?.provider?.name === getName(provider) &&
      host.spec?.provider?.namespace === getNamespace(provider)
    ) {
      hostMap.set(host.spec.id, host);
    }
  }

  const result: InventoryHostNetworkTriple[] = inventories.map((inventory) => {
    const host = hostMap.get(inventory.id);
    let networkAdapter: NetworkAdapters | undefined;
    if (host?.spec?.ipAddress && inventory?.networkAdapters) {
      networkAdapter = inventory.networkAdapters.find(
        (adapter) => adapter?.ipAddress === host.spec?.ipAddress,
      );
    }
    return { host, inventory, networkAdapter };
  });

  return result;
};
