import useProviderInventory, {
  type UseProviderInventoryParams,
} from 'src/modules/Providers/hooks/useProviderInventory';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import type { ProviderHost, VSphereResource } from '@kubev2v/types';

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
): [Record<string, ProviderHost>, Record<string, VSphereResource>] => {
  const validProvider = providerLoaded && !providerLoadError && provider;

  const hostsInventoryOptions: UseProviderInventoryParams = {
    interval: 180000,
    provider: validProvider,
    subPath: 'hosts?detail=4',
  };

  const { inventory: hosts } = useProviderInventory<ProviderHost[]>(hostsInventoryOptions);

  const foldersInventoryOptions: UseProviderInventoryParams = {
    interval: 180000,
    provider: validProvider,
    subPath: 'folders?detail=4',
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
const convertArrayToDictionary = <T,>(resources: T[]): Record<string, T> => {
  if (!resources || !Array.isArray(resources)) {
    return undefined;
  }

  return resources.reduce<Record<string, T>>((dict, resource) => {
    dict[resource.id] = resource;
    return dict;
  }, {});
};
