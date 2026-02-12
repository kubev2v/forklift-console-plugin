import type { FC } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';

import AddVirtualMachinesButton from '../../AddVirtualMachines/AddVirtualMachinesButton';
import DeleteVirtualMachinesButton from '../../DeleteVirtualMachines/DeleteVirtualMachinesButton';
import type { SpecVirtualMachinePageData } from '../utils/types';

type PageGlobalActions = FC<GlobalActionToolbarProps<SpecVirtualMachinePageData>>[];

export const useSpecVirtualMachinesActions = (plan: V1beta1Plan): PageGlobalActions => {
  return [
    () => <AddVirtualMachinesButton plan={plan} />,
    ({ selectedIds }) => (
      <DeleteVirtualMachinesButton selectedIds={selectedIds ?? []} plan={plan} />
    ),
  ];
};
