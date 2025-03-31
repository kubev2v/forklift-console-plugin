import {
  NetworkMapModel,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1StorageMap,
  type V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Updates the existing data of a Kubernetes planNetworkMaps and  planStorageMaps resources.
 *
 * @param {planNetworkMaps} V1beta1NetworkMap - The planNetworkMaps original object.
 * @param {planStorageMaps} V1beta1StorageMap - The planStorageMaps original object.
 * @param {updatedNetwork} V1beta1NetworkMapSpecMap[] - The V1beta1NetworkMapSpecMap array, containing the updated data.
 * @param {updatedStorage} V1beta1StorageMapSpecMap[] - The V1beta1StorageMapSpecMap array, containing the updated data.
 * @returns {Promise<void>} A promise that resolves when the patch operation is complete.
 */
export async function patchPlanMappingsData(
  planNetworkMaps: V1beta1NetworkMap,
  planStorageMaps: V1beta1StorageMap,
  updatedNetwork: V1beta1NetworkMapSpecMap[],
  updatedStorage: V1beta1StorageMapSpecMap[],
) {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/map',
        value: updateNetworkMapSpecMapDestination(updatedNetwork),
      },
    ],
    model: NetworkMapModel,
    resource: planNetworkMaps,
  });

  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/map',
        value: updatedStorage,
      },
    ],
    model: StorageMapModel,
    resource: planStorageMaps,
  });
}

/**
 * Updates the destination name and namespace in the network map entries.
 * If the destination name contains a '/', it splits the name into two parts.
 * The first part becomes the new namespace, and the second part becomes the new name.
 *
 * @param {NetworkMap} networkMap - The network map object to update.
 * @returns {NetworkMap} The updated network map object.
 */
export function updateNetworkMapSpecMapDestination(
  networkMaps: V1beta1NetworkMapSpecMap[],
): V1beta1NetworkMapSpecMap[] {
  networkMaps?.forEach((entry) => {
    const parts = entry?.destination?.name?.split('/');
    if (parts?.length === 2) {
      entry.destination.namespace = parts[0];
      entry.destination.name = parts[1];
    }
  });
  return networkMaps;
}
