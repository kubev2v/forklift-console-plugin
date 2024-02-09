import { useMemo } from 'react';

import { OpenstackVolume, OVirtDisk, ProviderType, V1beta1Provider } from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

const subPath: { [keys in Partial<ProviderType>]?: string } = {
  ovirt: '/disks?detail=1',
  openstack: '/volumes?detail=1',
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
    return Array.isArray(disks)
      ? disks.map((d) => ({ ...d, providerType } as OVirtDisk | OpenstackVolume))
      : [];
  }, [providerType, disks]);

  return [stable, loading, error];
};
