import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@kubev2v/types';

import { planMigrationVirtualMachineStatuses } from '../components/PlanStatus/utils/types';

import { MULTUS, POD } from './constants';

export const isMigrationVirtualMachinePaused = (vm: V1beta1PlanStatusMigrationVms | undefined) =>
  vm?.phase === planMigrationVirtualMachineStatuses.CopyingPaused;

export const getPlanMigrationType = (plan: V1beta1Plan): MigrationTypeValue => {
  // check the new type field first then fall back to the warm bool
  switch (plan?.spec?.type) {
    case 'warm':
      return MigrationTypeValue.Warm;
    case 'live':
      return MigrationTypeValue.Live;
    case undefined:
    case 'cold':
    default:
      if (plan?.spec?.warm) {
        return MigrationTypeValue.Warm;
      }
      return MigrationTypeValue.Cold;
  }
};

export const isMapDestinationTypeSupported = (type: string): boolean =>
  type === MULTUS || type === POD;
