import { OpenstackVolume, OVirtDisk } from '@kubev2v/types';

import { VmData } from '../../details';

// based on packages/legacy/src/Plans/components/Wizard/helpers.tsx
export const getStoragesUsedBySelectedVms = (
  selectedVMs: VmData[],
  disks: (OVirtDisk | OpenstackVolume)[],
): string[] => {
  return Array.from(
    new Set(
      selectedVMs
        ?.map(({ vm }) => vm)
        .flatMap((vm) => {
          switch (vm.providerType) {
            case 'vsphere': {
              return vm.disks?.map((disk) => disk?.datastore?.id);
            }
            case 'openstack': {
              const vmDisks =
                vm.attachedVolumes?.map((av) =>
                  (disks as OpenstackVolume[]).find((disk) => disk.id === av.ID),
                ) ?? [];
              const volumeTypeIds = vmDisks.map((disk) => disk?.volumeType);
              return volumeTypeIds;
            }
            case 'ovirt': {
              const vmDisks = vm.diskAttachments?.map((da) =>
                (disks as OVirtDisk[]).find((disk) => disk.id === da.disk),
              );
              const storageDomainIds = vmDisks?.map((disk) => disk?.storageDomain);
              return storageDomainIds;
            }
            default:
              return [];
          }
        })
        .filter(Boolean),
    ),
  );
};
