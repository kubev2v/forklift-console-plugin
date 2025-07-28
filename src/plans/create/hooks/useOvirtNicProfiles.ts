import { useMemo } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import type { OVirtNicProfile, V1beta1Provider } from '@kubev2v/types';

export const useOvirtNicProfiles = (
  provider: V1beta1Provider | undefined,
): [OVirtNicProfile[], boolean, Error | null] => {
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

  const typedNicProfiles: OVirtNicProfile[] = useMemo(
    () => (Array.isArray(nicProfiles) ? nicProfiles : []),
    [nicProfiles],
  );

  return [typedNicProfiles, loading, error];
};
