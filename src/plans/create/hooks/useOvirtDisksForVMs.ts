import { useMemo } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { OVirtDisk, OVirtVM, ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

/**
 * Fetches oVirt disk data and adds storage domain info to VMs
 */
export const useOvirtDisksForVMs = (
  provider: V1beta1Provider | undefined,
  vms: ProviderVirtualMachine[],
) => {
  const isOvirtProvider = provider?.spec?.type === PROVIDER_TYPES.ovirt;

  const {
    error: disksError,
    inventory: disks,
    loading: disksLoading,
  } = useProviderInventory<OVirtDisk[]>({
    disabled: !isOvirtProvider,
    provider,
    subPath: 'disks?detail=10',
  });

  const vmsWithDisks = useMemo(() => {
    if (!isOvirtProvider || disksLoading || isEmpty(vms) || isEmpty(disks)) {
      return vms;
    }

    const diskMap = new Map<string, OVirtDisk>();
    disks?.forEach((disk) => {
      diskMap.set(disk.id, disk);
    });

    return vms.map((vm) => {
      const ovirtVm = vm as OVirtVM;
      const vmDisks =
        ovirtVm.diskAttachments
          ?.map((attachment) => {
            const disk = diskMap.get(attachment.disk);
            return disk ? { id: disk.id, storageDomain: disk.storageDomain } : null;
          })
          .filter(Boolean) ?? [];

      return { ...vm, disks: vmDisks };
    });
  }, [isOvirtProvider, disksLoading, vms, disks]);

  return { error: disksError, loading: disksLoading, vmsWithDisks };
};
