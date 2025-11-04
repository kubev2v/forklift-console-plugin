import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { STORAGE_NAMES } from 'src/storageMaps/constants';

import type { V1beta1Provider } from '@kubev2v/types';

import type { StorageMapping } from '../../constants';
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
