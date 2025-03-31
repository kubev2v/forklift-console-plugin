import { useMemo } from 'react';

import type { OVirtNicProfile, V1beta1Provider } from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

/**
 * Works only for oVirt
 */
export const useNicProfiles = (provider: V1beta1Provider): [OVirtNicProfile[], boolean, Error] => {
  const isOVirt = provider?.spec?.type === 'ovirt';
  const {
    error,
    inventory: nicProfiles,
    loading,
  } = useProviderInventory<OVirtNicProfile[]>({
    disabled: !provider || !isOVirt,
    provider,
    subPath: '/nicprofiles?detail=1',
  });

  const stable = useMemo(() => {
    if (!isOVirt) {
      return [];
    }
    return Array.isArray(nicProfiles) ? nicProfiles : [];
  }, [isOVirt, nicProfiles]);

  return [stable, loading, error];
};
