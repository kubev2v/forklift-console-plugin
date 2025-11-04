import type { V1beta1NetworkMap } from '@kubev2v/types';
import { deepCopy } from '@utils/deepCopy';

/**
 * Updates the destination name and namespace in the network map entries.
 * If the destination name contains a '/', it splits the name into two parts.
 * The first part becomes the new namespace, and the second part becomes the new name.
 *
 * @param {NetworkMap} networkMap - The network map object to update.
 * @returns {NetworkMap} The updated network map object.
 */
export const updateNetworkMapDestination = (networkMap: V1beta1NetworkMap): V1beta1NetworkMap => {
  const networkMapCopy = deepCopy(networkMap)!;

  networkMapCopy?.spec?.map?.forEach((entry) => {
    const [namespace, name] = entry?.destination?.name?.split('/') ?? [];
    if (namespace && name) {
      entry.destination.namespace = namespace;
      entry.destination.name = name;
    }
  });
  return networkMapCopy;
};
