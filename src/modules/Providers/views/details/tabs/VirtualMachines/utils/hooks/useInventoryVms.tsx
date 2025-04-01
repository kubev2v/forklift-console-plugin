import useProviderInventory, {
  UseProviderInventoryParams,
} from 'src/modules/Providers/hooks/useProviderInventory';
import { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { isProviderLocalOpenshift, isProviderOpenshift } from 'src/utils/resources';

import { OpenshiftVM, ProviderVirtualMachine } from '@kubev2v/types';

import { VmData } from '../../components/VMCellProps';

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
    provider: validProvider,
    subPath: 'vms?detail=4',
    interval: 180000,
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
          namespace: isProviderOpenshift(validProvider) ? (vm as OpenshiftVM).namespace : undefined,
          isProviderLocalOpenshift: isProviderLocalOpenshift(validProvider),
        }))
      : [];

  return [vmData, loading, error];
};
