import { useMemo } from 'react';

import type { OpenstackVolume, OVirtDisk, ProviderType, V1beta1Provider } from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

const subPath: Partial<Record<Partial<ProviderType>, string>> = {
  openstack: '/volumes?detail=1',
  ovirt: '/disks?detail=1',
};

const glanceStorage: OpenstackVolume = {
  attachments: [],
  availabilityZone: '',
  bootable: 'false',
  createdAt: '',
  encrypted: false,
  id: 'glance',
  multiattach: false,
  name: 'glance',
  providerType: 'openstack',
  replicationStatus: '',
  revision: 1,
  selfLink: '',
  size: 1,
  status: 'available',
  updatedAt: '',
  userID: '0',
  volumeType: 'glance',
};

/**
 * Works only for oVirt and OpenStack
 */
export const useDisks = (
  provider: V1beta1Provider,
): [(OVirtDisk | OpenstackVolume)[], boolean, Error] => {
  const providerType = provider?.spec?.type;
  const {
    error,
    inventory: disks,
    loading,
  } = useProviderInventory<(OVirtDisk | OpenstackVolume)[]>({
    disabled: !provider || !subPath[providerType],
    provider,
    subPath: subPath[providerType] ?? '',
  });

  const stable = useMemo(() => {
    if (!subPath[providerType]) {
      return [];
    }

    const storageList = Array.isArray(disks)
      ? disks.map((disk) => ({ ...disk, providerType }) as OVirtDisk | OpenstackVolume)
      : [];

    if (providerType === 'openstack') {
      storageList.push(glanceStorage);
    }

    return storageList;
  }, [providerType, disks]);

  return [stable, loading, error];
};
