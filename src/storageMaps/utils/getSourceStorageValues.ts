import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import type { CategorizedSourceMappings } from 'src/plans/create/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import type { InventoryStorage } from 'src/utils/hooks/useStorages';

import type {
  OpenshiftVM,
  ProviderVirtualMachine,
  V1beta1Provider,
  V1Volume,
  VSphereVM,
} from '@kubev2v/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';
import { isEmpty } from '@utils/helpers';

import type { OVirtVMWithDisks } from './types';

/**
 * Extracts volume names from vSphere VMs (no option to extract storage classes data)
 */
// TODO: need backend to support fetching the used source storages by VMs for OCP.
// For now, we fetch all volumes instead of storages for ocp mappings, so if no volume is used then no storage is needed for mapping.
const getOpenshiftVolumeNames = (vm: ProviderVirtualMachine): string[] => {
  const openshiftVM = vm as OpenshiftVM;

  const volumes: V1Volume[] | undefined = openshiftVM?.object?.spec?.template?.spec?.volumes;
  if (!volumes || !Array.isArray(volumes)) {
    return [];
  }

  return volumes.reduce<string[]>(
    (acc, volume) => (volume?.name ? [...acc, volume?.name] : acc),
    [],
  );
};

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

      case 'openshift':
        storageIds = getOpenshiftVolumeNames(vm);
        break;

      case 'openstack':
      default:
      // Use empty array
    }

    storageIds.forEach((id) => acc.add(id));
    return acc;
  }, new Set());

  return Array.from(storageIdSet);
};

/**
 * Categorizes available source storages into 'used' and 'other' based on VM usage.
 * This helps prioritize storages that need mapping in the UI.
 */
const getSourceStorageValues = (
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): CategorizedSourceMappings => {
  const storageIdsUsedByVms = getStoragesUsedBySelectedVms(vms);
  const usedStorageIds = new Set(storageIdsUsedByVms);

  return availableSourceStorages.reduce<CategorizedSourceMappings>(
    (acc, storage) => {
      const storageEntry = {
        id: storage.id,
        name: getMapResourceLabel(storage),
      };

      if (
        usedStorageIds.has(storage.id) ||
        (storage.providerType === PROVIDER_TYPES.openshift && !isEmpty(usedStorageIds))
      ) {
        acc.used.push(storageEntry);
      } else {
        acc.other.push(storageEntry);
      }

      return acc;
    },
    { other: [], used: [] },
  );
};

/**
 * Filters storages to only those used by the provided VMs.
 * Used for OVA providers where we only want to show relevant storages.
 */
const filterStoragesByVmUsage = (
  availableStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): InventoryStorage[] => {
  const storageIdsUsedByVms = getStoragesUsedBySelectedVms(vms);
  const usedStorageIds = new Set(storageIdsUsedByVms);
  return availableStorages.filter((storage) => usedStorageIds.has(storage.id));
};

/**
 * Categorizes source storages with OVA provider filtering.
 * For OVA: only shows storages used by the provided VMs.
 * For other providers: shows all storages categorized by usage.
 */
export const getSourceStorageValuesForSelectedVms = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[] | null,
): CategorizedSourceMappings => {
  const sourceProviderType = sourceProvider?.spec?.type;

  // For OVA providers, filter storages to only those used by the provided VMs
  const relevantStorages =
    sourceProviderType === PROVIDER_TYPES.ova
      ? filterStoragesByVmUsage(availableSourceStorages, vms)
      : availableSourceStorages;

  return getSourceStorageValues(relevantStorages, vms);
};
