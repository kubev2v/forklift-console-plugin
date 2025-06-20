import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import type { CategorizedSourceMappings } from 'src/plans/create/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';

/**
 * Identifies all unique storage IDs used by the selected VMs
 * Handles different provider types with appropriate storage extraction logic
 */
const getStoragesUsedBySelectedVms = (selectedVMs: ProviderVirtualMachine[] | null): string[] =>
  Array.from(
    new Set(
      selectedVMs?.flatMap((vm) => {
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
  vms: ProviderVirtualMachine[] | null,
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
