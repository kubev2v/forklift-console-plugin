import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { mapSourceStoragesToLabels } from 'src/modules/Providers/views/migrate/reducer/mapSourceToLabels';

import type {
  OpenstackVM,
  OpenstackVolume,
  OVirtDisk,
  OVirtVM,
  ProviderVirtualMachine,
  V1beta1Provider,
} from '@kubev2v/types';

import type { SourceProviderMappingLabels } from '../../types';

import { StorageMapFieldId, type StorageMapping } from './constants';

type StorageMappingId = `${StorageMapFieldId.StorageMap}.${number}.${keyof StorageMapping}`;

export const getStorageMapFieldId = (id: keyof StorageMapping, index: number): StorageMappingId =>
  `${StorageMapFieldId.StorageMap}.${index}.${id}`;

const getOpenstackVolumeTypeIds = (vm: OpenstackVM, disks: (OVirtDisk | OpenstackVolume)[]) => {
  const vmDisks =
    vm.attachedVolumes?.map((av) =>
      (disks as OpenstackVolume[])?.find((disk) => disk.id === av.ID),
    ) ?? [];
  const volumeTypeIds: string[] = vmDisks ? vmDisks.map((disk) => disk?.volumeType ?? '') : [];

  if (vm?.imageID) {
    volumeTypeIds.push('glance');
  }

  return volumeTypeIds;
};

const getOvirtStorageDomainIds = (vm: OVirtVM, disks: (OVirtDisk | OpenstackVolume)[]) => {
  const vmDisks = vm.diskAttachments?.map((da) =>
    (disks as OVirtDisk[]).find((disk) => disk.id === da.disk),
  );
  const storageDomainIds: string[] = vmDisks
    ? vmDisks.map((disk) => disk?.storageDomain ?? '')
    : [];

  return storageDomainIds;
};

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

export const getSourceStorageLabels = (
  sourceProvider: V1beta1Provider | undefined,
  availableSourceStorages: InventoryStorage[],
  vms: ProviderVirtualMachine[],
): SourceProviderMappingLabels => {
  const sourceProviderType = sourceProvider?.spec?.type ?? '';
  const storageIdsUsedBySelectedVms = ['ovirt', 'openstack'].includes(sourceProviderType)
    ? []
    : getStoragesUsedBySelectedVms({}, vms, []);
  const sourceNetworkLabelMap = mapSourceStoragesToLabels(availableSourceStorages);

  return Object.entries(sourceNetworkLabelMap).reduce(
    (acc: SourceProviderMappingLabels, [storageLabel]) => {
      const hasNetworksUsedByVms = storageIdsUsedBySelectedVms.some(
        (id) => id === sourceNetworkLabelMap[storageLabel] || id === storageLabel,
      );

      if (hasNetworksUsedByVms) {
        acc.used.push(storageLabel);
      } else {
        acc.other.push(storageLabel);
      }

      return acc;
    },
    {
      other: [],
      used: [],
    },
  );
};
