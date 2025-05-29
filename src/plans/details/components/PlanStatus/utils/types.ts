export enum MigrationVirtualMachineStatusIcon {
  Canceled = 'Canceled',
  CantStart = 'CantStart',
  Failed = 'Failed',
  InProgress = 'InProgress',
  Paused = 'Paused',
  Succeeded = 'Succeeded',
}

export type MigrationVirtualMachinesStatusesCounts = {
  [MigrationVirtualMachineStatusIcon.Canceled]: number;
  [MigrationVirtualMachineStatusIcon.CantStart]: number;
  [MigrationVirtualMachineStatusIcon.Failed]: number;
  [MigrationVirtualMachineStatusIcon.InProgress]: number;
  [MigrationVirtualMachineStatusIcon.Paused]: number;
  [MigrationVirtualMachineStatusIcon.Succeeded]: number;
};

export enum PlanStatuses {
  Unknown = 'Unknown',
  Completed = 'Completed',
  Archived = 'Archived',
  Canceled = 'Canceled',
  CannotStart = 'CannotStart',
  Incomplete = 'Incomplete',
  Paused = 'Paused',
  Executing = 'Executing',
  Ready = 'Ready',
}

export const planMigrationVirtualMachineStatuses = {
  CopyingPaused: 'CopyingPaused',
} as const;
