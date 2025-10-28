import type { FC } from 'react';

import { DrawerProvider } from '@components/DrawerContext/DrawerProvider';

import {
  canPlanReStart,
  isPlanExecuting,
  isPlanSucceeded,
} from '../../components/PlanStatus/utils/utils';
import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import MigrationStatusVirtualMachinesList from './components/MigrationStatusVirtualMachineList/MigrationStatusVirtualMachinesList';
import PlanSpecVirtualMachinesList from './components/PlanSpecVirtualMachinesList/PlanSpecVirtualMachinesList';

const PlanVirtualMachinesPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { plan } = usePlan(name, namespace);
  if (isPlanExecuting(plan) || isPlanSucceeded(plan) || canPlanReStart(plan)) {
    return (
      <DrawerProvider>
        <MigrationStatusVirtualMachinesList plan={plan} />
      </DrawerProvider>
    );
  }

  return <PlanSpecVirtualMachinesList plan={plan} />;
};

export default PlanVirtualMachinesPage;
