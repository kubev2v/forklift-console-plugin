import type { FC } from 'react';
import {
  canPlanReStart,
  isPlanExecuting,
  isPlanSucceeded,
} from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import type { PlanPageProps } from '../../utils/types';

import MigrationStatusVirtualMachinesList from './components/MigrationStatusVirtualMachineList/MigrationStatusVirtualMachinesList';
import PlanSpecVirtualMachinesList from './components/PlanSpecVirtualMachinesList/PlanSpecVirtualMachinesList';

type PlanVirtualMachinesPageProps = {
  loaded: boolean;
  loadError: Error;
} & PlanPageProps;

const PlanVirtualMachinesPage: FC<PlanVirtualMachinesPageProps> = ({ plan }) => {
  if (isPlanExecuting(plan) || isPlanSucceeded(plan) || canPlanReStart(plan)) {
    return (
      <ModalHOC>
        <MigrationStatusVirtualMachinesList plan={plan} />
      </ModalHOC>
    );
  }

  return (
    <ModalHOC>
      <PlanSpecVirtualMachinesList plan={plan} />
    </ModalHOC>
  );
};

export default PlanVirtualMachinesPage;
