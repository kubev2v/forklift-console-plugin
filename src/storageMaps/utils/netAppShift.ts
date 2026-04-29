import {
  StorageClassAnnotation,
  type StorageMapping,
  type TargetStorage,
} from 'src/storageMaps/utils/types';

/** Value matching pkg/apis/forklift/v1beta1.ValueNetAppShiftStorageClassType */
export const NETAPP_SHIFT_STORAGE_CLASS_TYPE_VALUE = 'shift';

export const isNetAppShiftStorageClassAnnotations = (
  annotations: Record<string, string> | undefined,
): boolean =>
  annotations?.[StorageClassAnnotation.NetAppShiftStorageClassType] ===
  NETAPP_SHIFT_STORAGE_CLASS_TYPE_VALUE;

/**
 * Returns labels to apply to a StorageMap when any mapped target storage class
 * carries the NetApp Shift annotation.
 */
export const getNetAppShiftLabels = (
  mappings: StorageMapping[],
  targetStorages: TargetStorage[],
): Record<string, string> | undefined => {
  const hasNetAppShift = mappings?.some(
    (mapping) =>
      targetStorages.find((ts) => ts.name === mapping.targetStorage?.name)?.isNetAppShift,
  );

  return hasNetAppShift
    ? {
        [StorageClassAnnotation.NetAppShiftStorageClassType]: NETAPP_SHIFT_STORAGE_CLASS_TYPE_VALUE,
      }
    : undefined;
};
