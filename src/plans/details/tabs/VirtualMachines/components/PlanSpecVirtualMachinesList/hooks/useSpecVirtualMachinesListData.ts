import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';

import type { V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import { getPlanVirtualMachinesDict } from '../../utils/utils';
import type { SpecVirtualMachinePageData } from '../utils/types';
import { getPlanConditionsDict } from '../utils/utils';

export const useSpecVirtualMachinesListData = (
  plan: V1beta1Plan,
): [SpecVirtualMachinePageData[], V1beta1Provider] => {
  const virtualMachines = getPlanVirtualMachines(plan);

  const { sourceProvider } = usePlanSourceProvider(plan);
  const [vmInventoryData, loading] = useInventoryVms({ provider: sourceProvider });
  if (loading) {
    return [[], sourceProvider];
  }
  const inventoryVmDict = vmInventoryData.reduce<Record<string, VmData>>((acc, vmData) => {
    acc[vmData.vm.id] = vmData;
    return acc;
  }, {});

  const vmDict = getPlanVirtualMachinesDict(plan);
  const conditionsDict = getPlanConditionsDict(plan);

  const specVirtualMachinesListData = virtualMachines.map((specVM, vmIndex) => ({
    conditions: conditionsDict[specVM.id!],
    inventoryVmData: inventoryVmDict[specVM.id!],
    plan,
    specVM,
    statusVM: vmDict[specVM.id!],
    targetNamespace: plan?.spec?.targetNamespace,
    vmIndex,
  })) as SpecVirtualMachinePageData[];

  return [specVirtualMachinesListData, sourceProvider];
};
