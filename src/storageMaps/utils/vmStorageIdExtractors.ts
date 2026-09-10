import type {
  HypervVM,
  OpenshiftVM,
  ProviderVirtualMachine,
  V1Volume,
  VSphereVM,
} from '@forklift-ui/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';
import { isEmpty } from '@utils/helpers';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { OVirtVMWithDisks } from '@utils/storage/types';
import { getNutanixStorageContainerIds, isNutanixVm } from '@utils/types/nutanixInventory';

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

const getOvaStorageIds = (vm: EnhancedOvaVM): string[] => {
  type RawDisk = { ID?: string };
  return (
    vm.disks?.reduce<string[]>((acc, disk) => {
      const id = (disk as unknown as RawDisk).ID ?? disk.id;
      return id ? [...acc, id] : acc;
    }, []) ?? []
  );
};

const getHypervStorageIds = (vm: ProviderVirtualMachine): string[] => {
  const hypervVM = vm as HypervVM;
  return (
    hypervVM.disks?.reduce<string[]>((acc, disk) => {
      const datastoreId = (disk as unknown as { datastore?: { id: string } })?.datastore?.id;
      return datastoreId ? [...acc, datastoreId] : acc;
    }, []) ?? []
  );
};

const getOvirtStorageIds = (vm: OVirtVMWithDisks): string[] => {
  const diskToStorageMap =
    vm.disks?.reduce<Map<string, string>>((map, disk) => {
      if (disk.id && disk.storageDomain) {
        map.set(disk.id, disk.storageDomain);
      }

      return map;
    }, new Map<string, string>()) ?? new Map<string, string>();

  const storageFromAttachments = vm.diskAttachments?.reduce<string[]>((acc, attachment) => {
    const storageId = diskToStorageMap.get(attachment.disk);
    return storageId ? [...acc, storageId] : acc;
  }, []);

  if (!isEmpty(storageFromAttachments)) {
    return storageFromAttachments || [];
  }

  const storageFromDisks = vm.disks?.reduce<string[]>(
    (acc, disk) => (disk.storageDomain ? [...acc, disk.storageDomain] : acc),
    [],
  );

  if (!isEmpty(storageFromDisks)) {
    return storageFromDisks ?? [];
  }

  return [];
};

const getStorageIdsForVm = (vm: ProviderVirtualMachine): string[] => {
  if (isNutanixVm(vm)) {
    return getNutanixStorageContainerIds(vm);
  }

  switch (vm.providerType) {
    case PROVIDER_TYPES.vsphere:
      return getVSphereStorageIds(vm);
    case PROVIDER_TYPES.ova:
      return getOvaStorageIds(vm as EnhancedOvaVM);
    case PROVIDER_TYPES.hyperv:
      return getHypervStorageIds(vm);
    case PROVIDER_TYPES.ovirt:
      return getOvirtStorageIds(vm);
    case PROVIDER_TYPES.openshift:
      return getOpenshiftVolumeNames(vm);
    case PROVIDER_TYPES.openstack:
    default:
      return [];
  }
};

export const getStoragesUsedBySelectedVms = (
  selectedVMs: ProviderVirtualMachine[] | null,
): string[] => {
  if (!selectedVMs || isEmpty(selectedVMs)) {
    return [];
  }

  const storageIdSet = selectedVMs.reduce<Set<string>>((acc, vm) => {
    for (const id of getStorageIdsForVm(vm)) {
      acc.add(id);
    }
    return acc;
  }, new Set());

  return Array.from(storageIdSet);
};
