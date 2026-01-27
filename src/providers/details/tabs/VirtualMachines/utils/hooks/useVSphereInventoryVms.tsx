import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import useProviderInventory, {
  type UseProviderInventoryParams,
} from 'src/utils/hooks/useProviderInventory';

import type { ProviderHost, V1beta1Provider, VSphereResource } from '@forklift-ui/types';

/**
 * Converts an array of Resource objects into a dictionary where the keys are the resource IDs.
 *
 * @param {T[]} resources - The array of Resource objects to convert.
 * @returns {{ [key: string]: T }} - A dictionary with resource IDs as keys and Resource objects as values.
 */
const convertArrayToDictionary = <T extends { id: string }>(
  resources: T[] | null | undefined, // Allow null here
): Record<string, T> => {
  if (!resources || !Array.isArray(resources)) {
    return {};
  }

  return resources.reduce<Record<string, T>>((dict, resource) => {
    dict[resource.id] = resource;
    return dict;
  }, {});
};

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
): [Record<string, ProviderHost>, Record<string, VSphereResource>, boolean, unknown] => {
  const validProvider: V1beta1Provider | undefined =
    providerLoaded && !providerLoadError ? provider : undefined;

  const hostsInventoryOptions: UseProviderInventoryParams = {
    interval: 180000,
    provider: validProvider,
    subPath: 'hosts?detail=4',
  };

  const {
    error,
    inventory: hosts,
    loading: providersLoading,
  } = useProviderInventory<ProviderHost[]>(hostsInventoryOptions);

  const foldersInventoryOptions: UseProviderInventoryParams = {
    interval: 180000,
    provider: validProvider,
    subPath: 'folders?detail=4',
  };

  const { inventory: folders, loading: foldersLoading } =
    useProviderInventory<VSphereResource[]>(foldersInventoryOptions);

  const foldersDict = convertArrayToDictionary(folders);
  const hostsDict = convertArrayToDictionary(hosts);
  const loading = providersLoading || foldersLoading;

  return [hostsDict, foldersDict, loading, error];
};
