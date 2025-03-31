import { useProviderInventory, type UseProviderInventoryParams } from 'src/modules/Providers/hooks';
import type { ProviderData } from 'src/modules/Providers/utils';
import { isProviderLocalOpenshift, isProviderOpenshift } from 'src/utils/resources';

import type { OpenshiftVM, ProviderVirtualMachine } from '@kubev2v/types';

import type { VmData } from '../../components';

/**
 * A hook for retrieving VMs from the inventory.
 * Adds providerType property to each VM.
 *
 * @param providerData provider that is the source of the data
 * @param providerLoaded loading status of the parent provider
 * @param providerLoadError load error of the parent provider (if any)
 * @returns {Array} tuple containing: the data, loading status and load error (if any)
 */
export const useInventoryVms = (
  { provider }: ProviderData,
  providerLoaded: boolean,
  providerLoadError: unknown,
): [VmData[], boolean, Error] => {
  const validProvider = providerLoaded && !providerLoadError && provider;

  const inventoryOptions: UseProviderInventoryParams = {
    interval: 180000,
    provider: validProvider,
    subPath: 'vms?detail=4',
  };

  const {
    error,
    inventory: vms,
    loading,
  } = useProviderInventory<ProviderVirtualMachine[]>(inventoryOptions);

  const vmData: VmData[] =
    !loading && !error && Array.isArray(vms)
      ? vms.map((vm) => ({
          isProviderLocalOpenshift: isProviderLocalOpenshift(validProvider),
          name: vm.name,
          namespace: isProviderOpenshift(validProvider) ? (vm as OpenshiftVM).namespace : undefined,
          vm: {
            ...vm,
            providerType: provider?.spec?.type,
          } as ProviderVirtualMachine,
        }))
      : [];

  return [vmData, loading, error];
};
