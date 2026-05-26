/**
 * Provides API url.
 *
 * @param relativePath - An optional relative path to append to the URL
 * @returns The API URL
 */
const getApiUrl = (relativePath = ''): string => {
  const pluginPath = `/api/proxy/plugin/${process.env.PLUGIN_NAME}`;
  return `${pluginPath}/${relativePath}`;
};

/**
 * Provides API url for getting inventory.
 *
 * @param relativePath - An optional relative path to append to the URL
 * @returns The API URL for getting inventory
 */
export const getInventoryApiUrl = (relativePath = ''): string => {
  const inventoryPath = 'forklift-inventory';
  return `${getApiUrl(inventoryPath)}/${relativePath}`;
};

/**
 * Provides API url for getting services.
 *
 * @param relativePath - An optional relative path to append to the URL
 * @returns The API URL for getting services
 */
export const getServicesApiUrl = (relativePath = ''): string => {
  const path = 'forklift-services';
  return `${getApiUrl(path)}/${relativePath}`;
};

/**
 * Provides API url for the OVA proxy.
 *
 * @param relativePath - An optional relative path to append to the URL
 * @returns The API URL for the OVA proxy
 */
export const getOVAProxyUrl = (relativePath = ''): string => {
  const path = 'forklift-ova-proxy';
  return `${getApiUrl(path)}/${relativePath}`;
};
