import type { MigrationPerformanceMeta, MigrationSource } from '../migrationPerformanceTypes';

export const MIB = 1024 * 1024;

export const PERFORMANCE_META: MigrationPerformanceMeta = {
  migrationName: 'mig-1',
  migrationUid: 'uid-1',
  namespace: 'ns',
  planName: 'plan',
  planUid: 'plan-uid',
};

type TestTask = {
  completed?: string;
  name: string;
  progress: { completed: number; total: number };
  started?: string;
};

export const buildPipelineTask = (
  name: string,
  started: string | undefined,
  completed: string | undefined,
  done: number,
  total: number,
): TestTask => ({ completed, name, progress: { completed: done, total }, started });

export const buildMigrationSource = (
  vms: MigrationSource['vms'],
  started?: string,
  completed?: string,
): MigrationSource => ({ completed, started, vms });

export const toTimestamp = (value: string): number => new Date(value).getTime();
