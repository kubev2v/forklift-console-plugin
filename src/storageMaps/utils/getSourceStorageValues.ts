import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import type { CategorizedSourceMappings } from 'src/plans/create/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { ProviderVirtualMachine, V1beta1Provider, VSphereVM } from '@kubev2v/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';
import { isEmpty } from '@utils/helpers';

import type { OVirtVMWithDisks } from '../types';

/**
 * Extracts storage IDs from vSphere VMs
 */
const getVSphereStorageIds = (vm: ProviderVirtualMachine): string[] => {
  const vsphereVM = vm as VSphereVM;

  if (!vsphereVM.disks || !Array.isArray(vsphereVM.disks)) {
    return [];
  }

  return vsphereVM.disks.reduce<string[]>(
    (acc, disk) => (disk?.datastore?.id ? [...acc, disk.datastore.id] : acc),
    [],
  );
};

/**
 * Extracts storage IDs from OVA VMs
 */
const getOvaStorageIds = (vm: EnhancedOvaVM): string[] =>
  vm.disks?.reduce<string[]>((acc, disk) => (disk.ID ? [...acc, disk.ID] : acc), []) ?? [];

/**
 * Extracts storage IDs from oVirt VMs using disk attachments and storage domain data
 */
const getOvirtStorageIds = (vm: OVirtVMWithDisks): string[] => {
  // Create disk ID to storage domain mapping
  const diskToStorageMap =
    vm.disks?.reduce<Map<string, string>>((map, disk) => {
      if (disk.id && disk.storageDomain) {
        map.set(disk.id, disk.storageDomain);
      }

      return map;
    }, new Map()) ?? new Map();

  // Extract storage IDs from disk attachments using the mapping
  const storageFromAttachments = vm.diskAttachments?.reduce<string[]>((acc, attachment) => {
    const storageId: string = diskToStorageMap.get(attachment.disk);
    return storageId ? [...acc, storageId] : acc;
  }, []);

  if (!isEmpty(storageFromAttachments)) {
    return storageFromAttachments || [];
  }

  // Fallback: Extract storage domains directly from disks
  const storageFromDisks = vm.disks?.reduce<string[]>(
    (acc, disk) => (disk.storageDomain ? [...acc, disk.storageDomain] : acc),
    [],
  );

  if (!isEmpty(storageFromDisks)) {
    return storageFromDisks ?? [];
  }

  return [];
};

/**
 * Identifies unique storage IDs used by selected VMs across all provider types
 */
const getStoragesUsedBySelectedVms = (selectedVMs: ProviderVirtualMachine[] | null): string[] => {
  if (!selectedVMs || isEmpty(selectedVMs)) {
    return [];
  }

  const storageIdSet = selectedVMs.reduce<Set<string>>((acc, vm) => {
    let storageIds: string[] = [];

    switch (vm.providerType) {
      case 'vsphere':
        storageIds = getVSphereStorageIds(vm);
        break;

      case 'ova':
        storageIds = getOvaStorageIds(vm as EnhancedOvaVM);
        break;

      case 'ovirt':
        storageIds = getOvirtStorageIds(vm as OVirtVMWithDisks);
        break;

      case 'openstack':
      case 'openshift':
      default:
      // Use empty array
    }

    storageIds.forEach((id) => acc.add(id));
    return acc;
  }, new Set());

  return Array.from(storageIdSet);
};

/**
 * Categorizes available source storages into 'used' and 'other' based on VM usage
 * This helps prioritize storages that need mapping in the UI
 */
export const getSourceStorageValues = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): CategorizedSourceMappings => {
  const sourceProviderType = sourceProvider?.spec?.type;
  const storageIdsUsedByVms = getStoragesUsedBySelectedVms(vms);
  const usedStorageIds = new Set(storageIdsUsedByVms);
  // For OVA providers, filter storages to only those used by selected VMs
  const relevantStorages =
    sourceProviderType === PROVIDER_TYPES.ova
      ? availableSourceStorages.filter((storage) => usedStorageIds.has(storage.id))
      : availableSourceStorages;

  // Partition storages into used and other categories
  return relevantStorages.reduce<CategorizedSourceMappings>(
    (acc, storage) => {
      const storageEntry = {
        id: storage.id,
        name: getMapResourceLabel(storage),
      };

      if (usedStorageIds.has(storage.id)) {
        acc.used.push(storageEntry);
      } else {
        acc.other.push(storageEntry);
      }

      return acc;
    },
    { other: [], used: [] },
  );
};
