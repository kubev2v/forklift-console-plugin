import type {
  V1beta1MigrationStatusVms,
  V1beta1MigrationStatusVmsConditions,
} from '@forklift-ui/types';

export const isCanceled = (vm: V1beta1MigrationStatusVms): boolean =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Canceled') ??
  false;

export const isFailed = (vm: V1beta1MigrationStatusVms): boolean =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Failed') ??
  false;

export const isSucceeded = (vm: V1beta1MigrationStatusVms): boolean =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Succeeded') ??
  false;

export const isRunning = (vm: V1beta1MigrationStatusVms): boolean =>
  !isFailed(vm) && !isSucceeded(vm) && !isCanceled(vm) && vm?.phase !== 'Completed';
