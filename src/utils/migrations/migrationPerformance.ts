import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';
import { CATEGORY_TYPES } from '@utils/constants';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import {
  BYTES_PER_MIB,
  DISK_TRANSFER_STEPS,
  MIGRATION_PERFORMANCE_STATUS,
} from './migrationPerformanceConstants';
import { getConditionTime, getOverallStatus, getVmStatus } from './migrationPerformanceStatus';
import { secondsBetween, toMilliseconds } from './migrationPerformanceTime';
import type {
  MigrationPerformance,
  MigrationPerformanceMeta,
  MigrationSource,
  MigrationVmSource,
  PipelineStep,
  VmMigrationPerformance,
} from './migrationPerformanceTypes';

const getDiskSteps = (vm: MigrationVmSource): PipelineStep[] =>
  (vm.pipeline ?? []).filter((step) => DISK_TRANSFER_STEPS.includes(step.name ?? ''));

const getStepWindow = (
  step: PipelineStep,
  openEnd?: number,
): { ends: number[]; starts: number[] } => {
  const tasks = step.tasks ?? [];
  const taskStarts = tasks
    .map((task) => toMilliseconds(task.started))
    .filter((value): value is number => value !== undefined);
  const taskEnds = tasks
    .map(
      (task) =>
        toMilliseconds(task.completed) ??
        ((task.progress?.completed ?? 0) > 0 ? openEnd : undefined),
    )
    .filter((value): value is number => value !== undefined);

  if (!isEmpty(taskStarts) && !isEmpty(taskEnds)) {
    return { ends: taskEnds, starts: taskStarts };
  }

  return {
    ends: [toMilliseconds(step.completed)].filter((value): value is number => value !== undefined),
    starts: [toMilliseconds(step.started)].filter((value): value is number => value !== undefined),
  };
};

const getTransferWindow = (
  vms: MigrationVmSource[],
  openEnd: number | undefined,
): number | undefined => {
  const windows = vms.flatMap((vm) => getDiskSteps(vm).map((step) => getStepWindow(step, openEnd)));
  const starts = windows.flatMap(({ starts: values }) => values);
  const ends = windows.flatMap(({ ends: values }) => values);

  if (isEmpty(starts) || isEmpty(ends)) {
    return undefined;
  }

  return secondsBetween(Math.min(...starts), Math.max(...ends));
};

const computeVm = (
  vm: MigrationVmSource,
  now: number,
  openEnd?: number,
): VmMigrationPerformance => {
  const tasks = getDiskSteps(vm).flatMap((step) => step.tasks ?? []);
  const copiedUnits = tasks.reduce((sum, task) => sum + (task.progress?.completed ?? 0), 0);
  const expectedUnits = tasks.reduce((sum, task) => sum + (task.progress?.total ?? 0), 0);
  const transferSeconds = getTransferWindow([vm], openEnd);
  const copiedBytes = copiedUnits * BYTES_PER_MIB;

  return {
    copiedBytes,
    expectedBytes: expectedUnits * BYTES_PER_MIB,
    id: vm.id ?? '',
    name: vm.name ?? vm.id ?? '',
    status: getVmStatus(vm, now),
    transferRate: transferSeconds && copiedBytes > 0 ? copiedBytes / transferSeconds : undefined,
    transferSeconds,
  };
};

export const getMigrationPerformance = (
  source: MigrationSource,
  meta: MigrationPerformanceMeta,
  now: number = Date.now(),
): MigrationPerformance => {
  const sourceVms = source.vms ?? [];
  const status = getOverallStatus(sourceVms, now);
  const openEnd = status === MIGRATION_PERFORMANCE_STATUS.RUNNING ? now : undefined;
  const vms = sourceVms.map((vm) => computeVm(vm, now, openEnd));
  const copiedBytes = vms.reduce((sum, vm) => sum + vm.copiedBytes, 0);
  const expectedBytes = vms.reduce((sum, vm) => sum + vm.expectedBytes, 0);
  const durationSeconds = secondsBetween(
    toMilliseconds(source.started),
    toMilliseconds(source.completed) ??
      getConditionTime(source, CATEGORY_TYPES.CANCELED) ??
      openEnd,
  );
  const transferSeconds = getTransferWindow(sourceVms, openEnd);

  return {
    ...meta,
    avgTransferRate: transferSeconds && copiedBytes > 0 ? copiedBytes / transferSeconds : undefined,
    completedAt: source.completed,
    copiedBytes,
    durationSeconds,
    expectedBytes,
    overallRate: durationSeconds && copiedBytes > 0 ? copiedBytes / durationSeconds : undefined,
    startedAt: source.started,
    status,
    transferSeconds,
    vms,
  };
};

export const getMigrationResourcePerformance = (
  migration: V1beta1Migration | undefined,
  now: number = Date.now(),
): MigrationPerformance =>
  getMigrationPerformance(
    migration?.status ?? {},
    {
      migrationName: getName(migration) ?? '',
      migrationUid: migration ? (getUID(migration) ?? '') : '',
      namespace: getNamespace(migration) ?? '',
      planName: migration?.spec?.plan?.name ?? '',
      planUid: migration?.spec?.plan?.uid ?? '',
    },
    now,
  );

export const getPlanMigrationPerformance = (
  plan: V1beta1Plan | undefined,
  now: number = Date.now(),
): MigrationPerformance | undefined => {
  const migration = plan?.status?.migration;

  if (!plan || (!migration?.started && !migration?.vms?.length)) {
    return undefined;
  }

  return getMigrationPerformance(
    { ...migration, conditions: plan.status?.conditions },
    {
      migrationName: '',
      migrationUid: '',
      namespace: getNamespace(plan) ?? '',
      planName: getName(plan) ?? '',
      planUid: getUID(plan) ?? '',
    },
    now,
  );
};
