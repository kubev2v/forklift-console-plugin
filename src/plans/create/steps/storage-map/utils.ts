import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';
import { t } from '@utils/i18n';

import type { CategorizedSourceMappings, MappingValue } from '../../types';
import { getMapResourceLabel } from '../utils';

import { StorageMapFieldId, type StorageMapping } from './constants';

type StorageMappingId = `${StorageMapFieldId.StorageMap}.${number}.${keyof StorageMapping}`;

/**
 * Creates a field ID for a storage mapping at a specific index
 * Used for form field identification and validation
 */
export const getStorageMapFieldId = (id: keyof StorageMapping, index: number): StorageMappingId =>
  `${StorageMapFieldId.StorageMap}.${index}.${id}`;

/**
 * Identifies all unique storage IDs used by the selected VMs
 * Handles different provider types with appropriate storage extraction logic
 */
const getStoragesUsedBySelectedVms = (selectedVMs: ProviderVirtualMachine[]): string[] =>
  Array.from(
    new Set(
      selectedVMs.flatMap((vm) => {
        switch (vm.providerType) {
          case 'vsphere': {
            return vm.disks?.map((disk) => disk?.datastore?.id);
          }
          case 'ova': {
            return (vm as EnhancedOvaVM).disks.map((disk) => disk.ID);
          }
          case 'ovirt':
          case 'openstack':
          case 'openshift':
          case undefined:
          default:
            return [];
        }
      }),
    ),
  );

/**
 * Creates a map of storage ID to storage object for quick lookups
 */
const getInventoryStorageMap = (inventoryStorages: InventoryStorage[]) =>
  inventoryStorages.reduce((acc: Record<string, InventoryStorage>, inventoryStorage) => {
    acc[inventoryStorage.id] = inventoryStorage;
    return acc;
  }, {});

/**
 * Categorizes available source storages into 'used' and 'other' based on VM usage
 * This helps prioritize storages that need mapping in the UI
 */
export const getSourceStorageValues = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[],
): CategorizedSourceMappings => {
  const sourceProviderType = sourceProvider?.spec?.type ?? '';

  const storageIdsUsedBySelectedVms = getStoragesUsedBySelectedVms(vms);

  const selectedOvaVMsDiskIDs = new Set(storageIdsUsedBySelectedVms);

  const filteredOVAStoragesBySelectedVMs = availableSourceStorages.filter((storage) =>
    selectedOvaVMsDiskIDs.has(storage.id),
  );

  const sourceStorageMap = getInventoryStorageMap(
    sourceProviderType === PROVIDER_TYPES.ova
      ? filteredOVAStoragesBySelectedVMs
      : availableSourceStorages,
  );

  // Categorize storages into 'used' and 'other'
  return Object.entries(sourceStorageMap).reduce(
    (acc: CategorizedSourceMappings, [sourceStorageId, sourceStorage]) => {
      const hasStoragesUsedByVms = storageIdsUsedBySelectedVms.some((id) => id === sourceStorageId);

      if (hasStoragesUsedByVms) {
        acc.used.push({
          id: sourceStorageId,
          name: getMapResourceLabel(sourceStorage),
        });
      } else {
        acc.other.push({
          id: sourceStorageId,
          name: getMapResourceLabel(sourceStorage),
        });
      }

      return acc;
    },
    {
      other: [],
      used: [],
    },
  );
};

/**
 * Validates storage mappings by ensuring all storage devices detected on source VMs
 * have corresponding mappings in the provided values
 *
 * @param values - Array of storage mappings configured by user
 * @param usedSourceStorages - Array of storage devices that need to be mapped
 * @returns Error message string if any storage is unmapped, undefined if all are mapped
 */
export const validateStorageMap = (
  values: StorageMapping[],
  usedSourceStorages: MappingValue[],
) => {
  if (
    !usedSourceStorages.every((usedStorage) =>
      values.find((value) => value[StorageMapFieldId.SourceStorage].name === usedStorage.name),
    )
  ) {
    return t('All storages detected on the selected VMs require a mapping.');
  }

  return undefined;
};
