export enum MigrationVirtualMachineStatus {
  Canceled = 'Canceled',
  CantStart = 'CantStart',
  Failed = 'Failed',
  InProgress = 'InProgress',
  Paused = 'Paused',
  Succeeded = 'Succeeded',
}

export const statusPriority: Record<MigrationVirtualMachineStatus, number> = {
  [MigrationVirtualMachineStatus.Canceled]: 2,
  [MigrationVirtualMachineStatus.CantStart]: 3,
  [MigrationVirtualMachineStatus.Failed]: 1,
  [MigrationVirtualMachineStatus.InProgress]: 4,
  [MigrationVirtualMachineStatus.Paused]: 5,
  [MigrationVirtualMachineStatus.Succeeded]: 0,
};

export type MigrationVirtualMachinesStatusCountObjectVM = {
  name: string;
  failedTaskName?: string;
};

export type MigrationVirtualMachinesStatusCountObject = {
  count: number;
  vms: MigrationVirtualMachinesStatusCountObjectVM[];
};

export type MigrationVirtualMachinesStatusesCounts = {
  [MigrationVirtualMachineStatus.Canceled]: MigrationVirtualMachinesStatusCountObject;
  [MigrationVirtualMachineStatus.CantStart]: MigrationVirtualMachinesStatusCountObject;
  [MigrationVirtualMachineStatus.Failed]: MigrationVirtualMachinesStatusCountObject;
  [MigrationVirtualMachineStatus.InProgress]: MigrationVirtualMachinesStatusCountObject;
  [MigrationVirtualMachineStatus.Paused]: MigrationVirtualMachinesStatusCountObject;
  [MigrationVirtualMachineStatus.Succeeded]: MigrationVirtualMachinesStatusCountObject;
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

export type StatusPopoverLabels = { header: string; body?: string; actionLabel?: string };
