import type { FC } from 'react';
import { usePlanMigration } from 'src/modules/Plans/hooks/usePlanMigration';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils/helpers/getPlanPhase';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@kubev2v/types';

import CancelMigrationVirtualMachinesButton from '../../CancelMigrationVirtualMachines/CancelMigrationVirtualMachinesButton';
import DeleteVirtualMachinesButton from '../../DeleteVirtualMachines/DeleteVirtualMachinesButton';
import type { MigrationStatusVirtualMachinePageData } from '../utils/types';

type PageGlobalActions = FC<GlobalActionToolbarProps<MigrationStatusVirtualMachinePageData>>[];

export const useMigrationVirtualMachineActions = (plan: V1beta1Plan): PageGlobalActions => {
  const [lastMigration] = usePlanMigration(plan);

  const isExecuting = isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);

  return [
    ({ selectedIds }) =>
      isExecuting && !isArchived ? (
        <CancelMigrationVirtualMachinesButton
          selectedIds={selectedIds ?? []}
          migration={lastMigration}
        />
      ) : (
        <DeleteVirtualMachinesButton selectedIds={selectedIds ?? []} plan={plan} />
      ),
  ];
};
