import { useMemo } from 'react';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';

import type { ProviderVirtualMachine, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

export const usePlanMappingVms = (
  plan: V1beta1Plan,
  sourceProvider: V1beta1Provider,
): Record<string, ProviderVirtualMachine> => {
  const [providerVmData, isVmDataLoading] = useInventoryVms({ provider: sourceProvider });

  const planVmIds = getPlanVirtualMachines(plan).map((vm) => vm.id);

  return useMemo(() => {
    if (isVmDataLoading) {
      return {};
    }
    return providerVmData?.reduce((acc: Record<string, ProviderVirtualMachine>, data) => {
      if (!planVmIds.includes(data.vm.id)) return acc;

      return {
        ...acc,
        [data.vm.id]: data.vm,
      };
    }, {});
  }, [providerVmData, isVmDataLoading, planVmIds]);
};
