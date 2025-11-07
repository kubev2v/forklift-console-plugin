import type { V1beta1StorageMapSpecMap } from '@kubev2v/types';

export const transformOCPStorageMapDataToK8sFormat = (
  currentUpdatedStorage: V1beta1StorageMapSpecMap[],
): V1beta1StorageMapSpecMap[] => {
  const transformedMappings = currentUpdatedStorage.reduce<V1beta1StorageMapSpecMap[]>(
    (acc, mapping) => {
      const baseMapping: V1beta1StorageMapSpecMap = {
        destination: {
          storageClass: mapping.destination.storageClass,
        },
        source: {
          name: mapping?.source?.name,
        },
      };

      acc.push(baseMapping);
      return acc;
    },
    [],
  );

  return transformedMappings;
};
