import type { V1beta1StorageMap } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import {
  defaultStorageMapping,
  OffloadPlugin,
  StorageMapFieldId,
  type StorageMapping,
} from '../constants';

import type { UpdateMappingsFormData } from './constants';
import type { CustomV1beta1StorageMapSpecMap } from './types';

/**
 * Transforms form values into the format expected by the k8s StorageMap spec
 */
export const transformFormValuesToK8sSpec = (
  formValues: UpdateMappingsFormData,
  existingStorageMap: V1beta1StorageMap,
  isOpenshift = false,
): V1beta1StorageMap | undefined => {
  if (!existingStorageMap.spec) {
    return undefined;
  }

  // Filter incomplete mappings and transform to k8s format
  const transformedMappings = formValues.storageMap.reduce<CustomV1beta1StorageMapSpecMap[]>(
    (acc, mapping) => {
      // Skip incomplete mappings
      if (!mapping.sourceStorage?.name || !mapping.targetStorage?.name) {
        return acc;
      }

      const baseMapping: CustomV1beta1StorageMapSpecMap = {
        destination: {
          storageClass: mapping.targetStorage.name,
        },
        source: {
          id: isOpenshift ? undefined : mapping.sourceStorage.id,
          name: mapping.sourceStorage.name.startsWith('/')
            ? mapping.sourceStorage.name.slice(1)
            : mapping.sourceStorage.name,
        },
      };

      // Add offload plugin data if all required fields are present
      if (mapping.offloadPlugin && mapping.storageProduct && mapping.storageSecret) {
        acc.push({
          ...baseMapping,
          offloadPlugin: {
            vsphereXcopyConfig: {
              secretRef: mapping.storageSecret,
              storageVendorProduct: mapping.storageProduct,
            },
          },
        });
      } else {
        acc.push(baseMapping);
      }
      return acc;
    },
    [],
  );

  return {
    ...existingStorageMap,
    spec: {
      ...existingStorageMap.spec,
      map: transformedMappings,
    },
  };
};

/**
 * Transforms storage map K8s spec to form-compatible structure
 */
export const transformStorageMapToFormValues = (
  storageMap: V1beta1StorageMap,
): UpdateMappingsFormData => {
  if (isEmpty(storageMap) || !storageMap?.spec?.map) {
    return {
      storageMap: [defaultStorageMapping],
    };
  }

  const transformedStorageMap = storageMap.spec.map.map(
    (mapping: CustomV1beta1StorageMapSpecMap) => {
      const sourceId = mapping.source?.id ?? '';
      const sourceName = mapping.source?.name ?? '';
      const displayName = sourceId
        ? (storageMap.status?.references?.find((ref) => ref.id === sourceId)?.name ?? sourceName)
        : sourceName;

      return {
        offloadPlugin: mapping.offloadPlugin ? OffloadPlugin.VSphereXcopyConfig : '',
        sourceStorage: {
          id: sourceId,
          name: displayName,
        },
        storageProduct: mapping.offloadPlugin?.vsphereXcopyConfig?.storageVendorProduct ?? '',
        storageSecret: mapping.offloadPlugin?.vsphereXcopyConfig?.secretRef ?? '',
        targetStorage: {
          name: mapping.destination?.storageClass ?? '',
        },
      };
    },
  );

  return {
    storageMap: transformedStorageMap,
  };
};

/**
 * Validates storage mapping configurations to ensure complete and valid mappings
 * @param values - Array of storage mappings to validate
 * @returns Translation key string for validation error or undefined if valid
 */
export const validateUpdatedStorageMaps = (values: StorageMapping[]) => {
  if (!Array.isArray(values)) return t('Invalid mappings');

  let emptyCount = 0;
  let validCount = 0;
  let incompleteCount = 0;

  // Count empty, valid, and incomplete rows
  for (const value of values) {
    const hasSource = Boolean(value[StorageMapFieldId.SourceStorage]?.name);
    const hasTarget = Boolean(value[StorageMapFieldId.TargetStorage]?.name);

    if (!hasSource && !hasTarget) {
      emptyCount += 1;
    } else if (hasSource && hasTarget) {
      validCount += 1;
    } else {
      // Incomplete row: either source or target is missing
      incompleteCount += 1;
    }
  }

  // Any empty rows are invalid
  if (emptyCount > 0) {
    return t('Each row must have both source and target storage selected');
  }

  // Any incomplete rows are invalid
  if (incompleteCount > 0) {
    return t('Each row must have both source and target storage selected');
  }

  // No valid rows
  if (validCount === 0) {
    return t('At least one row must have both source and target storages');
  }

  return undefined;
};
