import { useProviderInventory, UseProviderInventoryParams } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';

import { ProviderHost, VSphereResource } from '@kubev2v/types';

/**
 * A hook for retrieving hosts and folders from the inventory.
 *
 * @param providerData provider that is the source of the data
 * @param providerLoaded loading status of the parent provider
 * @param providerLoadError load error of the parent provider (if any)
 * @returns {Array} tuple containing: the hosts and folders data
 */
export const useVSphereInventoryVms = (
  { provider }: ProviderData,
  providerLoaded: boolean,
  providerLoadError: unknown,
): [{ [key: string]: ProviderHost }, { [key: string]: VSphereResource }] => {
  const validProvider = providerLoaded && !providerLoadError && provider;

  const hostsInventoryOptions: UseProviderInventoryParams = {
    provider: validProvider,
    subPath: 'hosts?detail=4',
    interval: 180000,
  };

  const { inventory: hosts } = useProviderInventory<ProviderHost[]>(hostsInventoryOptions);

  const foldersInventoryOptions: UseProviderInventoryParams = {
    provider: validProvider,
    subPath: 'folders?detail=4',
    interval: 180000,
  };

  const { inventory: folders } = useProviderInventory<VSphereResource[]>(foldersInventoryOptions);

  const foldersDict = convertArrayToDictionary(folders);
  const hostsDict = convertArrayToDictionary(hosts);

  return [hostsDict, foldersDict];
};

/**
 * Converts an array of Resource objects into a dictionary where the keys are the resource IDs.
 *
 * @param {T[]} resources - The array of Resource objects to convert.
 * @returns {{ [key: string]: T }} - A dictionary with resource IDs as keys and Resource objects as values.
 */
function convertArrayToDictionary<T>(resources: T[]): { [key: string]: T } {
  if (!resources) {
    return undefined;
  }

  return resources.reduce((dict, resource) => {
    dict[resource['id']] = resource;
    return dict;
  }, {} as { [key: string]: T });
}
