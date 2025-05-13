import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import type {
  OpenstackVM,
  OpenstackVolume,
  OVirtDisk,
  OVirtVM,
  ProviderVirtualMachine,
  V1beta1Provider,
} from '@kubev2v/types';

import type { CategorizedSourceMappings } from '../../types';

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
 * Creates a human-readable label for storage based on provider type
 * Different providers have different naming conventions
 */
const getStorageMapLabel = (storage: InventoryStorage): string => {
  switch (storage.providerType) {
    case 'openshift': {
      return `${storage.namespace}/${storage.name}`;
    }
    case 'ova':
    case 'vsphere':
    case 'openstack': {
      return storage.name;
    }
    case 'ovirt': {
      // Use path for oVirt if available, fall back to name
      return storage.path ?? storage.name;
    }
    default: {
      return '';
    }
  }
};

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
          name: getStorageMapLabel(sourceStorage),
        });
      } else {
        acc.other.push({
          id: sourceStorageId,
          name: getStorageMapLabel(sourceStorage),
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
