import { useProviderInventory, UseProviderInventoryParams } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';

import { ProviderVirtualMachine } from '@kubev2v/types';

import { VmData } from '../components';

import { getHighestPriorityConcern } from './helpers';

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
  { provider, inventory }: ProviderData,
  providerLoaded: boolean,
  providerLoadError: unknown,
): [VmData[], boolean, Error] => {
  const largeInventory = inventory?.vmCount > 1000;
  const customTimeoutAndInterval = largeInventory ? 250000 : undefined;
  const validProvider = providerLoaded && !providerLoadError && provider;

  const inventoryOptions: UseProviderInventoryParams = {
    provider: validProvider,
    subPath: 'vms?detail=4',
    fetchTimeout: customTimeoutAndInterval,
    interval: customTimeoutAndInterval,
  };

  const {
    inventory: vms,
    loading,
    error,
  } = useProviderInventory<ProviderVirtualMachine[]>(inventoryOptions);

  const vmData: VmData[] =
    !loading && !error && Array.isArray(vms)
      ? vms.map((vm) => ({
          vm: {
            ...vm,
            providerType: provider?.spec?.type,
          } as ProviderVirtualMachine,
          name: vm.name,
          concerns: getHighestPriorityConcern(vm),
        }))
      : [];

  return [vmData, loading, error];
};
