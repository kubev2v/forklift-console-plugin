import { V1beta1Migration } from '@kubev2v/types';

import { MigrationPhase } from '../types';

export const getMigrationPhase = (migration: V1beta1Migration): MigrationPhase => {
  let phase: MigrationPhase = 'Unknown';

  const conditions = migration?.status?.conditions;

  if (!conditions || conditions.length < 1) {
    return phase;
  }

  // Check for vm errors
  const vmError = migration?.status.vms?.find((vm) => vm?.error);

  if (vmError) {
    return 'vmError';
  }

  const phases: MigrationPhase[] = ['Ready', 'Running', 'Succeeded', 'Failed'];

  // Look for a condition indicating a migration phase
  phases.forEach((p) => {
    const condition = conditions.find((c) => c.type === p && c.status === 'True');
    if (condition) {
      phase = p;
    }
  });

  return phase;
};
