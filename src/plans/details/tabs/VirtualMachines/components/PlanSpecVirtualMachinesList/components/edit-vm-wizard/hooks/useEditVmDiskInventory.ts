import { useMemo } from 'react';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';

import {
  buildExcludeDiskRows,
  getSelectableBusAddressesFromRows,
} from '../../ExcludeDisks/buildExcludeDiskRows';

type UseEditVmDiskInventoryResult = {
  diskLoadError: Error | null;
  isInventoryLoading: boolean;
  rows: ReturnType<typeof buildExcludeDiskRows>;
  selectableAddresses: string[];
};

export const useEditVmDiskInventory = (
  plan: V1beta1Plan,
  vmIndex: number,
  enabled = true,
): UseEditVmDiskInventoryResult => {
  const {
    loaded: providerLoaded,
    loadError: providerLoadError,
    sourceProvider,
  } = usePlanSourceProvider(plan);
  const vm = getPlanVirtualMachines(plan)[vmIndex];
  const specExcluded = useMemo(() => getVmExcludeDisks(vm) ?? [], [vm]);

  const [inventoryVms, inventoryLoading, inventoryError] = useInventoryVms(
    { provider: sourceProvider },
    providerLoaded,
    providerLoadError,
    !enabled,
  );

  const inventoryVm = useMemo(() => {
    const planVmId = vm?.id;
    if (planVmId) {
      return inventoryVms.find((entry) => entry.vm.id === planVmId);
    }

    return inventoryVms.find((entry) => entry.vm.name === vm?.name);
  }, [inventoryVms, vm?.id, vm?.name]);

  const disks = (inventoryVm?.vm as { disks?: unknown[] } | undefined)?.disks;

  const rows = useMemo(
    () =>
      buildExcludeDiskRows({
        disks,
        existingExcludeDisks: specExcluded,
      }),
    [disks, specExcluded],
  );

  const selectableAddresses = useMemo(() => getSelectableBusAddressesFromRows(rows), [rows]);

  return {
    diskLoadError: enabled ? (providerLoadError ?? inventoryError) : null,
    isInventoryLoading: enabled ? !providerLoaded || inventoryLoading : false,
    rows,
    selectableAddresses,
  };
};
