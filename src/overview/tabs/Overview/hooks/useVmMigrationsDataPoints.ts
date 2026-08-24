import type { Interval } from 'luxon';

import { MigrationModelGroupVersionKind, type V1beta1Migration } from '@forklift-ui/types';
import { getName } from '@utils/crds/common/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { TimeRangeOptions } from '../utils/timeRangeOptions';
import type { MigrationDataPoint } from '../utils/types';

import { createBuckets, createTimeBuckets, toDayLabel, toHourLabel } from './migrationTimeBuckets';
import { isCanceled, isFailed, isRunning, isSucceeded } from './migrationVmStatusChecks';

type VmMigrationsDataPointsResult = {
  canceled: MigrationDataPoint[];
  failed: MigrationDataPoint[];
  intervals?: Interval[];
  loaded: boolean;
  loadError: unknown;
  obj?: V1beta1Migration[];
  running: MigrationDataPoint[];
  succeeded: MigrationDataPoint[];
  total: number;
  totalCanceledCount: number;
  totalFailedCount: number;
  totalRunningCount: number;
  totalSucceededCount: number;
};

export const useVmMigrationsDataPoints = (
  selectedRange: TimeRangeOptions,
  singleBucket = false,
): VmMigrationsDataPointsResult => {
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  if (!loaded) {
    return {
      canceled: [],
      failed: [],
      loaded,
      loadError,
      running: [],
      succeeded: [],
      total: 0,
      totalCanceledCount: 0,
      totalFailedCount: 0,
      totalRunningCount: 0,
      totalSucceededCount: 0,
    };
  }

  const intervals = createTimeBuckets(selectedRange, singleBucket);
  const buckets = createBuckets(intervals, migrations);

  const failed: MigrationDataPoint[] = [];
  const running: MigrationDataPoint[] = [];
  const succeeded: MigrationDataPoint[] = [];
  const canceled: MigrationDataPoint[] = [];
  let total = 0;
  let totalFailedCount = 0;
  let totalRunningCount = 0;
  let totalSucceededCount = 0;
  let totalCanceledCount = 0;

  for (const { interval, migrations: migrationsInBucket } of buckets) {
    let failedCount = 0;
    let runningCount = 0;
    let succeededCount = 0;
    let canceledCount = 0;
    const countedMigrations: Record<string, Record<string, boolean>> = {
      canceled: {},
      failed: {},
      running: {},
      succeeded: {},
    };

    for (const migration of migrationsInBucket) {
      const name = getName(migration) ?? '';
      for (const vm of migration?.status?.vms ?? []) {
        total += 1;
        if (isFailed(vm)) {
          failedCount += 1;
          totalFailedCount += 1;
          countedMigrations.failed[name] = true;
        } else if (isSucceeded(vm)) {
          succeededCount += 1;
          totalSucceededCount += 1;
          countedMigrations.succeeded[name] = true;
        } else if (isRunning(vm)) {
          runningCount += 1;
          totalRunningCount += 1;
          countedMigrations.running[name] = true;
        } else if (isCanceled(vm)) {
          canceledCount += 1;
          totalCanceledCount += 1;
          countedMigrations.canceled[name] = true;
        }
      }
    }

    const dateLabel =
      selectedRange === TimeRangeOptions.Last24H
        ? toHourLabel(interval.start)
        : toDayLabel(interval.start);

    failed.push({
      dateLabel,
      interval,
      migrations: Object.keys(countedMigrations.failed),
      value: failedCount,
    });
    running.push({
      dateLabel,
      interval,
      migrations: Object.keys(countedMigrations.running),
      value: runningCount,
    });
    succeeded.push({
      dateLabel,
      interval,
      migrations: Object.keys(countedMigrations.succeeded),
      value: succeededCount,
    });
    canceled.push({
      dateLabel,
      interval,
      migrations: Object.keys(countedMigrations.canceled),
      value: canceledCount,
    });
  }

  return {
    canceled,
    failed,
    intervals,
    loaded,
    loadError,
    obj: migrations,
    running,
    succeeded,
    total,
    totalCanceledCount,
    totalFailedCount,
    totalRunningCount,
    totalSucceededCount,
  };
};
