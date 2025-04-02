import type { V1beta1Migration } from '@kubev2v/types';

import type { MigrationPhase } from '../types/MigrationPhase';

export const getMigrationPhase = (migration: V1beta1Migration): MigrationPhase => {
  let phase: MigrationPhase;

  const conditions = migration?.status?.conditions;

  if (!conditions || conditions.length < 1) {
    return phase;
  }

  // Check for vm errors
  const vmError = migration?.status.vms?.find((vm) => vm?.error);

  const phases: MigrationPhase[] = ['Ready', 'Running', 'Succeeded', 'Failed'];

  // Look for a condition indicating a migration phase
  phases.forEach((phaseVal) => {
    const condition = conditions.find(
      (condition) => condition.type === phaseVal && condition.status === 'True',
    );
    if (condition) {
      phase = phaseVal;
    }
  });

  if (vmError && phase !== 'Failed') {
    return 'vmError';
  }

  return phase ?? 'Unknown';
};
