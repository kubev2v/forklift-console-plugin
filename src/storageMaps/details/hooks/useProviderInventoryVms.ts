import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import type { ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';

/**
 * Custom hook to fetch VM inventory for a provider
 */
export const useProviderInventoryVms = (provider: V1beta1Provider | undefined, enabled = true) => {
  return useProviderInventory<ProviderVirtualMachine[]>({
    disabled: !enabled || !provider,
    provider,
    subPath: 'vms?detail=4',
  });
};
