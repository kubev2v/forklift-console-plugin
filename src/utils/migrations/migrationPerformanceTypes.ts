import type { MigrationPerformanceStatus } from './migrationPerformanceConstants';

export type { MigrationPerformanceStatus };

export type PipelineTask = {
  completed?: string;
  name?: string;
  progress?: { completed?: number; total?: number };
  started?: string;
};

export type PipelineStep = {
  completed?: string;
  name?: string;
  started?: string;
  tasks?: PipelineTask[];
};

export type VmCondition = {
  lastTransitionTime?: string;
  status?: string;
  type?: string;
};

export type MigrationVmSource = {
  completed?: string;
  conditions?: VmCondition[];
  id?: string;
  name?: string;
  pipeline?: PipelineStep[];
  started?: string;
};

export type MigrationSource = {
  completed?: string;
  conditions?: VmCondition[];
  started?: string;
  vms?: MigrationVmSource[];
};

export type MigrationPerformanceMeta = {
  migrationName: string;
  migrationUid: string;
  namespace: string;
  planName: string;
  planUid: string;
};

export type VmMigrationPerformance = {
  copiedBytes: number;
  expectedBytes: number;
  id: string;
  name: string;
  status: MigrationPerformanceStatus;
  transferRate?: number;
  transferSeconds?: number;
};

export type MigrationPerformance = MigrationPerformanceMeta & {
  avgTransferRate?: number;
  completedAt?: string;
  copiedBytes: number;
  durationSeconds?: number;
  expectedBytes: number;
  overallRate?: number;
  startedAt?: string;
  status: MigrationPerformanceStatus;
  transferSeconds?: number;
  vms: VmMigrationPerformance[];
};
