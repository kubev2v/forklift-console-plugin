import { useCallback, useMemo } from 'react';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import { useInventoryVms } from 'src/providers/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';

import type { V1beta1Plan } from '@kubev2v/types';
import { getPlanTargetNamespace, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import { getPlanVirtualMachinesDict } from '../../utils/utils';
import type { SpecVirtualMachinePageData } from '../utils/types';
import { getPlanConditionsDict } from '../utils/utils';

const EMPTY_LIST = [] as SpecVirtualMachinePageData[];

export const useSpecVirtualMachinesListData = (
  plan: V1beta1Plan,
): [SpecVirtualMachinePageData[], boolean, Error | null] => {
  const { sourceProvider } = usePlanSourceProvider(plan);
  const [vmInventoryData, loading, error] = useInventoryVms({ provider: sourceProvider });

  const virtualMachines = useMemo(() => getPlanVirtualMachines(plan), [plan]);

  const vmDict = useMemo(() => getPlanVirtualMachinesDict(plan), [plan]);
  const conditionsDict = useMemo(() => getPlanConditionsDict(plan), [plan]);

  const getInventoryVmIdByName = useCallback(
    (vmName: string | undefined) => {
      return vmInventoryData.find((vmData) => vmData?.vm?.name === vmName)?.vm?.id;
    },
    [vmInventoryData],
  );

  const inventoryVmMap = useMemo(() => {
    const map = new Map<string, VmData>();
    for (const vmData of vmInventoryData) {
      const id = vmData?.vm?.id;
      if (id) {
        map.set(id, vmData);
      }
    }
    return map;
  }, [vmInventoryData]);

  const specVirtualMachinesListData = useMemo<SpecVirtualMachinePageData[]>(() => {
    if (loading || !isEmpty(error)) return EMPTY_LIST;

    const out: SpecVirtualMachinePageData[] = [];
    let vmIndex = 0;

    for (const specVM of virtualMachines) {
      const id = specVM?.id ?? getInventoryVmIdByName(specVM?.name);
      if (id) {
        out.push({
          conditions: conditionsDict[id],
          inventoryVmData: inventoryVmMap.get(id)!,
          plan,
          specVM,
          statusVM: vmDict[id],
          targetNamespace: getPlanTargetNamespace(plan)!,
          vmIndex,
        });
      }
      vmIndex += 1;
    }

    return out;
  }, [
    loading,
    error,
    virtualMachines,
    getInventoryVmIdByName,
    conditionsDict,
    inventoryVmMap,
    plan,
    vmDict,
  ]);

  return [specVirtualMachinesListData, loading, error];
};
