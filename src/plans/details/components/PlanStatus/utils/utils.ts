import type { TargetPowerStateValue } from 'src/plans/constants.ts';
import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type {
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { getPlanIsWarm, getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';
import { deepCopy } from '@utils/deepCopy';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { STATUS_POPOVER_VMS_COUNT_THRESHOLD } from './constants';
import {
  type MigrationVirtualMachinesStatusCountObjectVM,
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatus,
  PlanStatuses,
  type StatusPopoverLabels,
} from './types';

const emptyCount: MigrationVirtualMachinesStatusesCounts = {
  [MigrationVirtualMachineStatus.Canceled]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.CantStart]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.Failed]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.InProgress]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.Paused]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.Succeeded]: {
    count: 0,
    vms: [],
  },
};

export const getMigrationVMStatus = (
  vm?: V1beta1PlanStatusMigrationVms,
): MigrationVirtualMachineStatus | null => {
  const conditions = vm?.conditions ?? [];

  const isCanceled = conditions.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.CANCELED && condition.status === CONDITION_STATUS.TRUE,
  );
  if (isCanceled) return MigrationVirtualMachineStatus.Canceled;

  const isSucceeded = conditions.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.SUCCEEDED && condition.status === CONDITION_STATUS.TRUE,
  );
  if (isSucceeded) return MigrationVirtualMachineStatus.Succeeded;

  if (vm?.error) return MigrationVirtualMachineStatus.Failed;

  if (isMigrationVirtualMachinePaused(vm)) return MigrationVirtualMachineStatus.Paused;

  if (vm?.started && !vm?.completed && !vm?.error) {
    return MigrationVirtualMachineStatus.InProgress;
  }

  return null;
};

export const getCantStartVMStatusCount = (vms: V1beta1PlanSpecVms[]) => {
  return {
    ...emptyCount,
    [MigrationVirtualMachineStatus.CantStart]: {
      count: vms.length,
      vms: vms.map((vm) => ({ name: String(vm.name) })),
    },
  };
};

export const getMigrationVMsStatusCounts = (
  vms: V1beta1PlanStatusMigrationVms[],
  planSpecVMsTotal: number,
  phase?: PlanStatuses,
): MigrationVirtualMachinesStatusesCounts => {
  if (PlanStatuses.Paused === phase) {
    return {
      ...emptyCount,
      [MigrationVirtualMachineStatus.Paused]: {
        count: planSpecVMsTotal,
        vms: vms.map((vm) => ({ name: String(vm.name) })),
      },
    };
  }

  const counts: MigrationVirtualMachinesStatusesCounts = vms.reduce((acc, vm) => {
    const status = getMigrationVMStatus(vm);
    if (status) {
      acc[status].count += 1;
      const vmObj: MigrationVirtualMachinesStatusCountObjectVM = {
        name: String(vm.name),
      };
      if (status === MigrationVirtualMachineStatus.Failed) {
        vmObj.failedTaskName = (vm.pipeline ?? []).find((pipe) => pipe?.error)?.name;
      }
      acc[status].vms.push(vmObj);
    }
    return acc;
  }, deepCopy(emptyCount));

  return counts;
};

export const getVmTargetPowerState = (vm: V1beta1PlanSpecVms): TargetPowerStateValue =>
  vm?.targetPowerState as TargetPowerStateValue;

const getConditions = (plan: V1beta1Plan) =>
  (plan?.status?.conditions ?? [])
    ?.filter((condition) => condition.status === CONDITION_STATUS.TRUE)
    .map((condition) => condition.type);

export const isPlanExecuting = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes(PlanStatuses.Executing);
};

const isPlanWaitingForCutover = (plan: V1beta1Plan) =>
  getPlanVirtualMachinesMigrationStatus(plan).some(isMigrationVirtualMachinePaused) &&
  isPlanExecuting(plan) &&
  getPlanIsWarm(plan);

export const isPlanArchived = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);
  return (
    (plan?.spec?.archived && !conditions.includes(PlanStatuses.Archived)) ?? // Archiving
    conditions.includes(PlanStatuses.Archived)
  );
};

export const getPlanStatus = (plan: V1beta1Plan): PlanStatuses => {
  if (!plan) return PlanStatuses.Unknown;

  const conditions = getConditions(plan);

  if (isEmpty(conditions)) {
    return PlanStatuses.Unknown;
  }

  if (plan?.spec?.archived || conditions.includes(PlanStatuses.Archived)) {
    return PlanStatuses.Archived;
  }

  if (conditions.includes(CATEGORY_TYPES.SUCCEEDED)) {
    return PlanStatuses.Completed;
  }

  if (conditions.includes(CATEGORY_TYPES.CANCELED)) {
    return PlanStatuses.Canceled;
  }

  if (isPlanWaitingForCutover(plan)) {
    return PlanStatuses.Paused;
  }

  const isCritical = plan?.status?.conditions?.find(
    (condition) =>
      condition.category === CATEGORY_TYPES.CRITICAL && condition.status === CONDITION_STATUS.TRUE,
  );

  if (isCritical) {
    return PlanStatuses.CannotStart;
  }

  const vmError = plan?.status?.migration?.vms?.find((vm) => vm?.error);

  if (conditions.includes(CATEGORY_TYPES.FAILED) || vmError) {
    return PlanStatuses.Incomplete;
  }

  if (isPlanExecuting(plan)) {
    return PlanStatuses.Executing;
  }

  if (conditions.includes(PlanStatuses.Ready)) {
    return PlanStatuses.Ready;
  }

  return PlanStatuses.Unknown;
};

export const canPlanStart = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return (
    conditions?.includes(CATEGORY_TYPES.READY) &&
    !conditions?.includes(CATEGORY_TYPES.EXECUTING) &&
    !conditions?.includes(CATEGORY_TYPES.SUCCEEDED) &&
    !plan?.spec?.archived
  );
};

export const canPlanReStart = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return (
    conditions?.includes(CATEGORY_TYPES.FAILED) ?? conditions?.includes(CATEGORY_TYPES.CANCELED)
  );
};

export const isPlanSucceeded = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes(CATEGORY_TYPES.SUCCEEDED);
};

export const isPlanEditable = (plan: V1beta1Plan) => {
  const status = getPlanStatus(plan);
  return (
    status === PlanStatuses.Ready ||
    status === PlanStatuses.Canceled ||
    status === PlanStatuses.Incomplete ||
    status === PlanStatuses.Unknown ||
    status === PlanStatuses.CannotStart
  );
};

export const getPopoverMessageByStatus = (
  planStatus: MigrationVirtualMachineStatus,
  vmCount: number,
): StatusPopoverLabels => {
  const showAll = vmCount > STATUS_POPOVER_VMS_COUNT_THRESHOLD ? 'all ' : '';
  const isPlural = vmCount > 1 ? 's' : '';

  const popoverMessageMap: Record<MigrationVirtualMachineStatus, StatusPopoverLabels> = {
    [MigrationVirtualMachineStatus.Canceled]: {
      actionLabel: t('View {{showAll}}canceled VM{{isPlural}}', {
        isPlural,
        showAll,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration canceled', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.CantStart]: {
      actionLabel: t('View {{showAll}}VM{{isPlural}} that cannot start migration', {
        isPlural,
        showAll,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration cannot start', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.Failed]: {
      actionLabel: t('View {{showAll}}{{vmCount}} failed VM{{isPlural}}', {
        isPlural,
        showAll,
        vmCount,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration failed', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.InProgress]: {
      actionLabel: t('View {{showAll}}{{vmCount}} VM{{isPlural}} in progress', {
        isPlural,
        showAll,
        vmCount,
      }),
      header: t('{{vmCount}} VM{{isPlural}} migration in progress', { isPlural, vmCount }),
    },
    [MigrationVirtualMachineStatus.Paused]: {
      actionLabel: t('Schedule cutover'),
      body: t(
        'To resume, the cutover must be scheduled. When the cutover starts the {{vmCount}} VM{{isPlural}} included in this plan will shut down.',
        { isPlural, vmCount },
      ),
      header: t('{{vmCount}} VM{{isPlural}} migration paused until cutover scheduled', {
        isPlural,
        vmCount,
      }),
    },
    [MigrationVirtualMachineStatus.Succeeded]: {
      actionLabel: t('View {{showAll}}{{vmCount}} fully migrated VM{{isPlural}}', {
        isPlural,
        showAll,
        vmCount,
      }),
      header: t('{{vmCount}} VM{{isPlural}} fully migrated', { isPlural, vmCount }),
    },
  };

  return popoverMessageMap[planStatus] ?? { header: t('Unknown') };
};
