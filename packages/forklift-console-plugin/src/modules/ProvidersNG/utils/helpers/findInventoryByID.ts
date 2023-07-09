import { ProviderInventory, ProvidersInventoryList } from '@kubev2v/types';

/**
 * Finds an inventory by its unique identifier.
 *
 * @param {ProvidersInventoryList} inventory - The list of provider inventories by type.
 * @param {string} uid - The unique identifier of the inventory to be found.
 * @returns {ProviderInventory} - The inventory if found, undefined otherwise.
 */
export function findInventoryByID(
  inventory: ProvidersInventoryList,
  uid: string,
): ProviderInventory {
  if (!inventory || !uid) {
    return undefined;
  }

  const providers = [
    ...inventory.openshift,
    ...inventory.openstack,
    ...inventory.ovirt,
    ...inventory.vsphere,
  ];
  return providers.find((provider) => provider.uid === uid);
}
