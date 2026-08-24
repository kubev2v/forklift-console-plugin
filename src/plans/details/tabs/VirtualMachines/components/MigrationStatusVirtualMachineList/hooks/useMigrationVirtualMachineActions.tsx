import type { FC, ReactElement } from 'react';
import {
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';

import CancelMigrationVirtualMachinesButton from '../../CancelMigrationVirtualMachines/CancelMigrationVirtualMachinesButton';
import DeleteVirtualMachinesButton from '../../DeleteVirtualMachines/DeleteVirtualMachinesButton';
import type { MigrationStatusVirtualMachinePageData } from '../utils/types';

type PageGlobalActions = FC<GlobalActionToolbarProps<MigrationStatusVirtualMachinePageData>>[];

export const useMigrationVirtualMachineActions = (plan: V1beta1Plan): PageGlobalActions => {
  const [activeMigration] = usePlanMigration(plan);

  const isExecuting = isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);

  return [
    ({ selectedIds }): ReactElement =>
      isExecuting && !isArchived && activeMigration ? (
        <CancelMigrationVirtualMachinesButton
          migration={activeMigration}
          selectedIds={selectedIds ?? []}
        />
      ) : (
        <DeleteVirtualMachinesButton plan={plan} selectedIds={selectedIds ?? []} />
      ),
  ];
};
