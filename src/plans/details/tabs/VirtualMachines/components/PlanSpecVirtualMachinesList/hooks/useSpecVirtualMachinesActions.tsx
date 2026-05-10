import type { FC } from 'react';
import InspectVirtualMachinesButton from 'src/components/InspectVirtualMachines/InspectVirtualMachinesButton';
import { useCanInspectPlan } from 'src/plans/details/hooks/useCanInspectPlan';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';

import AddVirtualMachinesButton from '../../AddVirtualMachines/AddVirtualMachinesButton';
import DeleteVirtualMachinesButton from '../../DeleteVirtualMachines/DeleteVirtualMachinesButton';
import type { SpecVirtualMachinePageData } from '../utils/types';

type PageGlobalActions = FC<GlobalActionToolbarProps<SpecVirtualMachinePageData>>[];

export const useSpecVirtualMachinesActions = (plan: V1beta1Plan): PageGlobalActions => {
  const { canInspect, disabledReason, isVsphere, provider } = useCanInspectPlan(plan);

  const inspectButton: PageGlobalActions = isVsphere
    ? [
        () => (
          <InspectVirtualMachinesButton
            canInspect={canInspect}
            disabledReason={disabledReason}
            plan={plan}
            provider={provider}
          />
        ),
      ]
    : [];

  return [
    ...inspectButton,
    () => <AddVirtualMachinesButton plan={plan} />,
    ({ selectedIds }) => (
      <DeleteVirtualMachinesButton selectedIds={selectedIds ?? []} plan={plan} />
    ),
  ];
};
