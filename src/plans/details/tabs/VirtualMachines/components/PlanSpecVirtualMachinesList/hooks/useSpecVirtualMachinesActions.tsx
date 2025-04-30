import type { FC } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@kubev2v/types';

import DeleteVirtualMachinesButton from '../../DeleteVirtualMachines/DeleteVirtualMachinesButton';
import type { SpecVirtualMachinePageData } from '../utils/types';

type PageGlobalActions = FC<GlobalActionToolbarProps<SpecVirtualMachinePageData>>[];

export const useSpecVirtualMachinesActions = (plan: V1beta1Plan): PageGlobalActions => {
  return [
    ({ selectedIds }) => (
      <DeleteVirtualMachinesButton selectedIds={selectedIds ?? []} plan={plan} />
    ),
  ];
};
