import type { FC } from 'react';
import {
  canPlanReStart,
  isPlanExecuting,
  isPlanSucceeded,
} from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { DrawerProvider } from '@components/DrawerContext/DrawerProvider';

import type { PlanPageProps } from '../../utils/types';

import MigrationStatusVirtualMachinesList from './components/MigrationStatusVirtualMachineList/MigrationStatusVirtualMachinesList';
import PlanSpecVirtualMachinesList from './components/PlanSpecVirtualMachinesList/PlanSpecVirtualMachinesList';

const PlanVirtualMachinesPage: FC<PlanPageProps> = ({ plan }) => {
  if (isPlanExecuting(plan) || isPlanSucceeded(plan) || canPlanReStart(plan)) {
    return (
      <DrawerProvider>
        <ModalHOC>
          <MigrationStatusVirtualMachinesList plan={plan} />
        </ModalHOC>
      </DrawerProvider>
    );
  }

  return (
    <ModalHOC>
      <PlanSpecVirtualMachinesList plan={plan} />
    </ModalHOC>
  );
};

export default PlanVirtualMachinesPage;
