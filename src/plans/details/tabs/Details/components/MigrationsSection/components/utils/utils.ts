import {
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatusIcon,
} from 'src/plans/details/components/PlanStatus/utils/types';

export const getMigrationStatusIcon = (
  vmStatuses: MigrationVirtualMachinesStatusesCounts,
  migrationVMsCounts: number | undefined,
): MigrationVirtualMachineStatusIcon | null => {
  if (vmStatuses[MigrationVirtualMachineStatusIcon.Failed] > 0)
    return MigrationVirtualMachineStatusIcon.Failed;
  if (vmStatuses[MigrationVirtualMachineStatusIcon.Paused] > 0)
    return MigrationVirtualMachineStatusIcon.Paused;
  if (vmStatuses[MigrationVirtualMachineStatusIcon.Succeeded] === migrationVMsCounts)
    return MigrationVirtualMachineStatusIcon.Succeeded;

  return null;
};
