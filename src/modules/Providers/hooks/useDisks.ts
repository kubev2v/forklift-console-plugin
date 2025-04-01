import { useMemo } from 'react';

import { OpenstackVolume, OVirtDisk, ProviderType, V1beta1Provider } from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

const subPath: { [keys in Partial<ProviderType>]?: string } = {
  ovirt: '/disks?detail=1',
  openstack: '/volumes?detail=1',
};

const glanceStorage: OpenstackVolume = {
  providerType: 'openstack',
  id: 'glance',
  revision: 1,
  name: 'glance',
  selfLink: '',
  status: 'available',
  size: 1,
  availabilityZone: '',
  createdAt: '',
  updatedAt: '',
  attachments: [],
  volumeType: 'glance',
  userID: '0',
  bootable: 'false',
  encrypted: false,
  replicationStatus: '',
  multiattach: false,
};

/**
 * Works only for oVirt and OpenStack
 */
export const useDisks = (
  provider: V1beta1Provider,
): [(OVirtDisk | OpenstackVolume)[], boolean, Error] => {
  const providerType = provider?.spec?.type;
  const {
    inventory: disks,
    loading,
    error,
  } = useProviderInventory<(OVirtDisk | OpenstackVolume)[]>({
    provider,
    subPath: subPath[providerType] ?? '',
    disabled: !provider || !subPath[providerType],
  });

  const stable = useMemo(() => {
    if (!subPath[providerType]) {
      return [];
    }

    const storageList = Array.isArray(disks)
      ? disks.map((d) => ({ ...d, providerType } as OVirtDisk | OpenstackVolume))
      : [];

    if (providerType === 'openstack') {
      storageList.push(glanceStorage);
    }

    return storageList;
  }, [providerType, disks]);

  return [stable, loading, error];
};
