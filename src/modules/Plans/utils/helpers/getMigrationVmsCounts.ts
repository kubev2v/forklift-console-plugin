import type { V1beta1PlanStatusMigrationVms } from '@kubev2v/types';

const emptyCount = {
  canceled: 0,
  completed: 0,
  error: 0,
  success: 0,
  total: 0,
};

export const getMigrationVmsCounts = (vms: V1beta1PlanStatusMigrationVms[]): MigrationVmsCounts => {
  if (!vms || vms.length < 1) {
    return emptyCount;
  }

  const vmsCanceled = vms.filter((vm) =>
    (vm?.conditions || []).find((c) => c.type === 'Canceled' && c.status === 'True'),
  );
  const vmsCompleted = vms.filter((vm) => vm?.completed);
  const vmsError = vms.filter((vm) => vm?.error);
  const success = vmsCompleted.length - vmsError.length - vmsCanceled.length;

  return {
    canceled: vmsCanceled.length,
    completed: vmsCompleted.length,
    error: vmsError.length,
    success: success >= 0 ? success : 0,
    total: vms.length,
  };
};

export type MigrationVmsCounts = {
  completed: number;
  total: number;
  canceled: number;
  error: number;
  success: number;
};
