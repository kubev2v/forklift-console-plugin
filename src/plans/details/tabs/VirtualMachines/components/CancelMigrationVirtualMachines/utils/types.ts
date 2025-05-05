import type { V1beta1Migration } from '@kubev2v/types';

export type CancelMigrationVirtualMachinesProps = {
  migration: V1beta1Migration;
  selectedIds: string[];
};
