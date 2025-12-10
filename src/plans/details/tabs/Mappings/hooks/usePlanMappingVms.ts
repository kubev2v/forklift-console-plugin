import { useMemo } from 'react';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';

import type { ProviderVirtualMachine, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

export const usePlanMappingVms = (
  plan: V1beta1Plan,
  sourceProvider: V1beta1Provider,
): [Record<string, ProviderVirtualMachine>, boolean, Error | null] => {
  const [providerVmData, isVmDataLoading, vmDataError] = useInventoryVms({
    provider: sourceProvider,
  });

  const planVmIds = getPlanVirtualMachines(plan).map((vm) => vm.id);

  const vmData = useMemo(() => {
    if (isVmDataLoading || !isEmpty(vmDataError)) {
      return {};
    }
    return providerVmData?.reduce((acc: Record<string, ProviderVirtualMachine>, data) => {
      if (!planVmIds.includes(data.vm.id)) return acc;

      return {
        ...acc,
        [data.vm.id]: data.vm,
      };
    }, {});
  }, [providerVmData, isVmDataLoading, planVmIds, vmDataError]);

  return [vmData, isVmDataLoading, vmDataError];
};
