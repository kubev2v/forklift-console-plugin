import type { V1beta1NetworkMapSpecMap, V1beta1StorageMapSpecMap } from '@kubev2v/types';

function hasPlanMappingsNetworkChanged(
  currPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
  nextPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
): boolean {
  // Both mappings don't have mapped entities
  if (!currPlanNetworkMaps && !nextPlanNetworkMaps) {
    return false;
  }

  // One of the mappings doesn't have data
  if (!currPlanNetworkMaps || !nextPlanNetworkMaps) {
    return true;
  }

  // Both mappings have data, but the number of mappings entries is different
  if (currPlanNetworkMaps.length !== nextPlanNetworkMaps.length) {
    return true;
  }

  // Compare each mapping entry
  for (const index in currPlanNetworkMaps) {
    if (
      currPlanNetworkMaps[index].source?.id !== nextPlanNetworkMaps[index].source?.id ||
      currPlanNetworkMaps[index].destination?.name !==
        nextPlanNetworkMaps[index].destination?.name ||
      currPlanNetworkMaps[index].destination?.type !==
        nextPlanNetworkMaps[index].destination?.type ||
      currPlanNetworkMaps[index].destination?.namespace !==
        nextPlanNetworkMaps[index].destination?.namespace
    ) {
      return true;
    }
  }

  // No differences found
  return false;
}

function hasPlanMappingsStorageChanged(
  currPlanStorageMaps: V1beta1StorageMapSpecMap[],
  nextPlanStorageMaps: V1beta1StorageMapSpecMap[],
): boolean {
  // Both mappings don't have mapped entities
  if (!currPlanStorageMaps && !nextPlanStorageMaps) {
    return false;
  }

  // One of the mappings doesn't have data
  if (!currPlanStorageMaps || !nextPlanStorageMaps) {
    return true;
  }

  // Both mappings have data, but the number of mappings entries is different
  if (currPlanStorageMaps.length !== nextPlanStorageMaps.length) {
    return true;
  }

  // Compare each mapping entry
  for (const index in currPlanStorageMaps) {
    if (
      currPlanStorageMaps[index].source?.id !== nextPlanStorageMaps[index].source?.id ||
      currPlanStorageMaps[index].destination?.storageClass !==
        nextPlanStorageMaps[index].destination?.storageClass
    ) {
      return true;
    }
  }

  // No differences found
  return false;
}

/**
 * Compares the plan's network and storage mappings between two versions.
 *
 * @param {V1beta1NetworkMapSpecMap[]} currPlanNetworkMaps - The first version of the network mappings plan.
 * @param {V1beta1StorageMapSpecMap[]} currPlanStorageMaps - The first version of the storage mappings plan.
 * @param {V1beta1NetworkMapSpecMap[]} nextPlanNetworkMaps - The second version of the network mappings plan.
 * @param {V1beta1StorageMapSpecMap[]} nextPlanStorageMaps - The second version of the storage mappings plan.
 *
 * @returns {boolean} Returns true if any of the data mappings have changed, otherwise returns false.
 */
export function hasPlanMappingsChanged(
  currPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
  currPlanStorageMaps: V1beta1StorageMapSpecMap[],
  nextPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
  nextPlanStorageMaps: V1beta1StorageMapSpecMap[],
): boolean {
  return (
    hasPlanMappingsNetworkChanged(currPlanNetworkMaps, nextPlanNetworkMaps) ||
    hasPlanMappingsStorageChanged(currPlanStorageMaps, nextPlanStorageMaps)
  );
}
