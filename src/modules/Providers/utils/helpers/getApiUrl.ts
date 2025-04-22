/**
 * Provides API url for getting inventory.
 *
 * @param {string} relativePath - An optional relative path to append to the URL
 * @returns {string} - The API URL for getting inventory
 */
export const getInventoryApiUrl = (relativePath = ''): string => {
  const inventoryPath = 'forklift-inventory';
  return `${getApiUrl(inventoryPath)}/${relativePath}`;
};

/**
 * Provides API url for getting services.
 *
 * @param {string} relativePath - An optional relative path to append to the URL
 * @returns {string} - The API URL for getting services
 */
export const getServicesApiUrl = (relativePath = ''): string => {
  const path = 'forklift-services';
  return `${getApiUrl(path)}/${relativePath}`;
};

/**
 * Provides API url.
 *
 * @param {string} relativePath - An optional relative path to append to the URL
 * @returns {string} - The API URL
 */
const getApiUrl = (relativePath = ''): string => {
  const pluginPath = `/api/proxy/plugin/${process.env.PLUGIN_NAME}`;
  return `${pluginPath}/${relativePath}`;
};
