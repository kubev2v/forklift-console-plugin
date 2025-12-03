import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { OffloadPlugin, STORAGE_NAMES } from 'src/storageMaps/constants';
import type { StorageMappingValue } from 'src/storageMaps/types';

import type {
  V1beta1Provider,
  V1beta1StorageMapSpecMap,
  V1beta1StorageMapSpecMapSource,
} from '@kubev2v/types';

import { StorageMapFieldId, type StorageMapping } from '../../constants';
import type { CustomStorageMapSpecMap, OffloadPluginConfig } from '../types';

import { createOffloadPluginConfig } from './createOffloadPluginConfig';

/**
 * Creates a storage mapping with optional offload plugin configuration
 * @param baseMapping - The base storage map structure
 * @param offloadPluginConfig - Optional offload plugin configuration to add
 * @returns Complete storage mapping with offload plugin if provided
 */
const createStorageMapping = (
  baseMapping: Omit<CustomStorageMapSpecMap, 'offloadPlugin'>,
  offloadPluginConfig?: OffloadPluginConfig,
): CustomStorageMapSpecMap => {
  const mapping: CustomStorageMapSpecMap = { ...baseMapping };

  if (offloadPluginConfig) {
    mapping.offloadPlugin = offloadPluginConfig;
  }

  return mapping;
};

/**
 * Converts storage mappings to storage map specification mappings
 * Handles different provider types and storage configurations
 * @param mappings - Array of storage mappings to process
 * @param sourceProvider - Source provider configuration
 * @returns Array of storage map specification mappings
 */
export const buildStorageMappings = (
  mappings: StorageMapping[],
  sourceProvider: V1beta1Provider | undefined,
): CustomStorageMapSpecMap[] => {
  if (!mappings) {
    return [];
  }
  return mappings.reduce((acc: CustomStorageMapSpecMap[], mapping) => {
    const { sourceStorage, targetStorage } = mapping;

    // Skip mappings without valid source and target storage
    if (!sourceStorage.name || !targetStorage.name) {
      return acc;
    }

    const offloadPluginConfig = createOffloadPluginConfig(mapping);
    const isOpenShiftProvider = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
    const isGlanceStorage = sourceStorage.name === STORAGE_NAMES.GLANCE;

    // OpenShift provider: uses name-based mapping
    if (isOpenShiftProvider) {
      const baseMapping = {
        destination: { storageClass: targetStorage.name },
        source: {
          name: sourceStorage.name.replace(/^\//gu, ''),
        },
      };
      acc.push(createStorageMapping(baseMapping, offloadPluginConfig));
    }

    // Glance storage: uses name-based mapping
    if (isGlanceStorage) {
      const baseMapping = {
        destination: { storageClass: targetStorage.name },
        source: {
          name: STORAGE_NAMES.GLANCE,
        },
      };
      acc.push(createStorageMapping(baseMapping, offloadPluginConfig));
    }

    // Default storage mapping: uses id-based mapping
    if (!isOpenShiftProvider && !isGlanceStorage) {
      const defaultBaseMapping = {
        destination: { storageClass: targetStorage.name },
        source: {
          id: sourceStorage.id,
        },
      };
      acc.push(createStorageMapping(defaultBaseMapping, offloadPluginConfig));
    }

    return acc;
  }, []);
};

const getSourceStorage = (
  source: V1beta1StorageMapSpecMapSource,
  sourceProvider: V1beta1Provider | undefined,
  sourceStorages: Map<string, InventoryStorage>,
): StorageMappingValue => {
  const isOpenShiftProvider = sourceProvider?.spec?.type === PROVIDER_TYPES.openshift;
  const isGlanceStorage = source.name === STORAGE_NAMES.GLANCE;

  if (isOpenShiftProvider) {
    return { name: `/${source.name}` };
  }

  if (isGlanceStorage) {
    return { name: STORAGE_NAMES.GLANCE };
  }

  return {
    id: source.id,
    name: getMapResourceLabel(sourceStorages.get(source?.id ?? '')) ?? '',
  };
};
/**
 * Converts storage map specification mappings to display-friendly storage mappings
 * that fits the form structure
 * @param specMappings - Array of storage map specification mappings to process
 * @param sourceProvider - Source provider configuration
 * @returns Array of storage mappings
 */
export const buildFormStorageMapping = (
  specMappings: V1beta1StorageMapSpecMap[] | undefined,
  sourceProvider: V1beta1Provider | undefined,
  sourceStorages: Map<string, InventoryStorage>,
): StorageMapping[] => {
  if (!specMappings) {
    return [];
  }
  return specMappings.map((specMapping) => {
    const { destination, offloadPlugin, source } = specMapping;

    const sourceStorage: StorageMappingValue = getSourceStorage(
      source,
      sourceProvider,
      sourceStorages,
    );

    const targetStorage: StorageMappingValue = {
      name: destination.storageClass,
    };

    const storageMapping: StorageMapping = {
      [StorageMapFieldId.SourceStorage]: sourceStorage,
      [StorageMapFieldId.TargetStorage]: targetStorage,
    };

    if (offloadPlugin) {
      storageMapping[StorageMapFieldId.OffloadPlugin] = offloadPlugin
        ? OffloadPlugin.VSphereXcopyConfig
        : '';
      storageMapping[StorageMapFieldId.StorageSecret] =
        offloadPlugin?.vsphereXcopyConfig?.secretRef ?? '';
      storageMapping[StorageMapFieldId.StorageProduct] =
        offloadPlugin?.vsphereXcopyConfig?.storageVendorProduct ?? '';
    }

    return storageMapping;
  });
};
