/**
 * Provides API url for getting inventory.
 *
 * @param {string} relativePath - An optional relative path to append to the URL
 * @returns {string} - The API URL for getting inventory
 */
export const getInventoryApiUrl = (relativePath = ''): string => {
  const pluginPath = `/api/proxy/plugin/${process.env.PLUGIN_NAME}`;
  const inventoryPath = '/forklift-inventory';

  return `${pluginPath}${inventoryPath}/${relativePath}`;
};
