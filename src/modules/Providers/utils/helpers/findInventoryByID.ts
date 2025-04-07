import type { ProviderInventory, ProvidersInventoryList } from '@kubev2v/types';

/**
 * Finds an inventory by its unique identifier.
 *
 * @param {ProvidersInventoryList} inventory - The list of provider inventories by type.
 * @param {string} uid - The unique identifier of the inventory to be found.
 * @returns {ProviderInventory} - The inventory if found, undefined otherwise.
 */
export const findInventoryByID = (
  inventory: ProvidersInventoryList,
  uid: string,
): ProviderInventory => {
  if (!inventory || !uid) {
    return undefined;
  }

  const providers = Object.keys(inventory).reduce<ProviderInventory[]>((flatInventory, key) => {
    return flatInventory.concat(inventory[key] || []);
  }, []);

  return providers.find((provider) => provider.uid === uid);
};
