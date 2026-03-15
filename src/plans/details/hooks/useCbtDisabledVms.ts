import { useMemo } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';

import type { ProviderVirtualMachine, V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

type VmWithCbt = ProviderVirtualMachine & { changeTrackingEnabled?: boolean };

export const useCbtDisabledVms = (
  plan: V1beta1Plan,
  sourceProvider?: V1beta1Provider,
): [ProviderVirtualMachine[], boolean] => {
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  const [providerVmData, isVmDataLoading] = useInventoryVms({
    provider: isVsphere ? sourceProvider : undefined,
  });

  const planVmIds = useMemo(() => new Set(getPlanVirtualMachines(plan).map((vm) => vm.id)), [plan]);

  const cbtDisabledVms = useMemo((): ProviderVirtualMachine[] => {
    if (isVmDataLoading || !isVsphere || isEmpty(providerVmData)) return [];

    return providerVmData
      .filter((data) => planVmIds.has(data.vm.id))
      .filter((data) => !(data.vm as VmWithCbt).changeTrackingEnabled)
      .map((data) => data.vm);
  }, [providerVmData, isVmDataLoading, isVsphere, planVmIds]);

  return [cbtDisabledVms, isVmDataLoading];
};
