import type { V1beta1Migration, V1beta1MigrationStatusVms } from '@kubev2v/types';

import type { TimeRangeOptions } from './timeRangeOptions';
import { type MigrationDataPoint, toDataPoints } from './toDataPointsHelper';

const toStartedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.started ?? '';

const toFinishedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.completed ?? '';

const toDataPointsForVmMigrations = (
  allVmMigrations: V1beta1MigrationStatusVms[],
  toTimestamp: (m: V1beta1MigrationStatusVms) => string,
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] => toDataPoints(allVmMigrations.map(toTimestamp), selectedTimeRange);

export const getVmMigrationsDataPoints = (
  migrations: V1beta1Migration[],
  selectedTimeRange: TimeRangeOptions,
): {
  running: MigrationDataPoint[];
  failed: MigrationDataPoint[];
  succeeded: MigrationDataPoint[];
} => ({
  failed: toDataPointsForVmMigrations(
    migrations
      .map((migration) =>
        (migration?.status?.vms ?? []).filter((vm) =>
          vm?.conditions?.find((it) => it?.type === 'Failed'),
        ),
      )
      .reduce((append, vm) => append.concat(vm), []),
    toFinishedVmMigration,
    selectedTimeRange,
  ),
  running: toDataPointsForVmMigrations(
    migrations
      .map((migration) =>
        (migration?.status?.vms ?? []).filter(
          (vm) => vm?.phase !== 'Completed' && vm?.phase !== 'Canceled',
        ),
      )
      .reduce((append, vm) => append.concat(vm), []),
    toStartedVmMigration,
    selectedTimeRange,
  ),
  succeeded: toDataPointsForVmMigrations(
    migrations
      .map((migration) =>
        (migration?.status?.vms ?? []).filter((vm) =>
          vm?.conditions?.find((it) => it?.type === 'Succeeded'),
        ),
      )
      .reduce((append, vm) => append.concat(vm), []),
    toFinishedVmMigration,
    selectedTimeRange,
  ),
});
