import type { MigrationPerformanceMeta, MigrationSource } from '../migrationPerformanceTypes';

export const MIB = 1024 * 1024;

export const META: MigrationPerformanceMeta = {
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
  started: string;
};

export const task = (
  name: string,
  started: string,
  completed: string | undefined,
  done: number,
  total: number,
): TestTask => ({ completed, name, progress: { completed: done, total }, started });

export const source = (
  vms: MigrationSource['vms'],
  started?: string,
  completed?: string,
): MigrationSource => ({ completed, started, vms });

export const at = (value: string): number => new Date(value).getTime();
