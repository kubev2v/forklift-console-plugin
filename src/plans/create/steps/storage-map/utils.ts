import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import type {
  OpenstackVM,
  OpenstackVolume,
  OVirtDisk,
  OVirtVM,
  ProviderVirtualMachine,
  V1beta1Provider,
} from '@kubev2v/types';
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
 * Extracts volume type IDs from an OpenStack VM
 * Includes both attached volumes and image-based disks
 */
const getOpenstackVolumeTypeIds = (vm: OpenstackVM, disks: (OVirtDisk | OpenstackVolume)[]) => {
  // Find volumes attached to this VM
  const vmDisks =
    vm.attachedVolumes?.map((av) =>
      (disks as OpenstackVolume[])?.find((disk) => disk.id === av.ID),
    ) ?? [];
  const volumeTypeIds: string[] = vmDisks ? vmDisks.map((disk) => disk?.volumeType ?? '') : [];

  // Include Glance image ID if VM is based on an image
  if (vm?.imageID) {
    volumeTypeIds.push('glance');
  }

  return volumeTypeIds;
};

/**
 * Extracts storage domain IDs from an oVirt VM's disk attachments
 */
const getOvirtStorageDomainIds = (vm: OVirtVM, disks: (OVirtDisk | OpenstackVolume)[]) => {
  // Find disks attached to this VM
  const vmDisks = vm.diskAttachments?.map((da) =>
    (disks as OVirtDisk[]).find((disk) => disk.id === da.disk),
  );
  const storageDomainIds: string[] = vmDisks
    ? vmDisks.map((disk) => disk?.storageDomain ?? '')
    : [];

  return storageDomainIds;
};

/**
 * Identifies all unique storage IDs used by the selected VMs
 * Handles different provider types with appropriate storage extraction logic
 */
const getStoragesUsedBySelectedVms = (
  sourceStorageLabelToId: Record<string, string>,
  selectedVMs: ProviderVirtualMachine[],
  disks: (OVirtDisk | OpenstackVolume)[],
): string[] =>
  Array.from(
    new Set(
      selectedVMs.flatMap((vm) => {
        switch (vm.providerType) {
          case 'vsphere': {
            return vm.disks?.map((disk) => disk?.datastore?.id);
          }
          case 'openstack': {
            return getOpenstackVolumeTypeIds(vm, disks);
          }
          case 'ovirt': {
            return getOvirtStorageDomainIds(vm, disks);
          }
          case 'ova': {
            // OVA uses the first available storage
            return [Object.values(sourceStorageLabelToId)[0]];
          }
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

  // Skip determining used storages for oVirt and OpenStack as they're handled differently
  const storageIdsUsedBySelectedVms = ['ovirt', 'openstack'].includes(sourceProviderType)
    ? []
    : getStoragesUsedBySelectedVms({}, vms, []);

  const sourceStorageMap = getInventoryStorageMap(availableSourceStorages);

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
