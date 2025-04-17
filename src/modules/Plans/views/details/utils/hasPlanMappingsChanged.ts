import type { V1beta1NetworkMapSpecMap, V1beta1StorageMapSpecMap } from '@kubev2v/types';

const hasPlanMappingsNetworkChanged = (
  currPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
  nextPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
): boolean => {
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
  for (let i = 0; i < currPlanNetworkMaps.length; i += 1) {
    const currMap = currPlanNetworkMaps[i];
    const nextMap = nextPlanNetworkMaps[i];

    if (
      currMap.source?.id !== nextMap.source?.id ||
      currMap.destination?.name !== nextMap.destination?.name ||
      currMap.destination?.type !== nextMap.destination?.type ||
      currMap.destination?.namespace !== nextMap.destination?.namespace
    ) {
      return true;
    }
  }

  // No differences found
  return false;
};

const hasPlanMappingsStorageChanged = (
  currPlanStorageMaps: V1beta1StorageMapSpecMap[],
  nextPlanStorageMaps: V1beta1StorageMapSpecMap[],
): boolean => {
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
  for (let i = 0; i < currPlanStorageMaps.length; i += 1) {
    const currMap = currPlanStorageMaps[i];
    const nextMap = nextPlanStorageMaps[i];

    if (
      currMap.source?.id !== nextMap.source?.id ||
      currMap.destination?.storageClass !== nextMap.destination?.storageClass
    ) {
      return true;
    }
  }

  // No differences found
  return false;
};

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
export const hasPlanMappingsChanged = (
  currPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
  currPlanStorageMaps: V1beta1StorageMapSpecMap[],
  nextPlanNetworkMaps: V1beta1NetworkMapSpecMap[],
  nextPlanStorageMaps: V1beta1StorageMapSpecMap[],
): boolean => {
  return (
    hasPlanMappingsNetworkChanged(currPlanNetworkMaps, nextPlanNetworkMaps) ||
    hasPlanMappingsStorageChanged(currPlanStorageMaps, nextPlanStorageMaps)
  );
};
