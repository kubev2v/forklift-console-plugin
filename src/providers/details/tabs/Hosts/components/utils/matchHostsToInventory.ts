import type { V1beta1Host, V1beta1Provider, VSphereHostInventory } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import type { InventoryHostNetworkTriple } from './types';

export const matchHostsToInventory = (
  inventories: VSphereHostInventory[],
  hosts: V1beta1Host[],
  provider: V1beta1Provider,
): InventoryHostNetworkTriple[] => {
  if (isEmpty(inventories)) {
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
    const networkAdapter =
      host?.spec?.ipAddress && inventory?.networkAdapters
        ? inventory.networkAdapters.find((adapter) => adapter?.ipAddress === host.spec?.ipAddress)
        : undefined;

    return { host, inventory, networkAdapter };
  });

  return result;
};
