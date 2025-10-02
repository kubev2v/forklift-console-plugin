import { DateTime, Interval } from 'luxon';
import { getMigrationStarted, getPlanKey } from 'src/overview/utils/utils';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1MigrationStatusVms,
  type V1beta1MigrationStatusVmsConditions,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName } from '@utils/crds/common/selectors';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';
import type { MigrationDataPoint } from '../utils/types';

const toHourLabel = (date: DateTime | null) =>
  date ? date.toLocal().toFormat('LLL dd HH:mm') : '';
const toDayLabel = (date: DateTime | null) => (date ? date.toLocal().toFormat('LLL dd') : '');

const createTimeBuckets = (selectedTimeRange: TimeRangeOptions, singleBucket = false) => {
  const { bucket, span, unit } = TimeRangeOptionsDictionary[selectedTimeRange];
  const now = DateTime.now().endOf(unit).toUTC();
  const start = now.minus(span).startOf(unit);
  let end = now;

  if (singleBucket) {
    // Return a single interval covering the whole selected range
    return [Interval.fromDateTimes(start, end)];
  }

  const bucketUnit: 'hour' | 'day' = 'hour' in bucket ? 'hour' : 'day';
  const bucketValue: number = 'hour' in bucket ? bucket.hour : bucket.day;

  end = now.plus({ [bucketUnit]: bucketValue }).startOf(bucketUnit);
  while (end <= now) {
    end = end.plus({ [bucketUnit]: bucketValue });
  }

  const intervals: Interval[] = [];
  let cursor = start;
  while (cursor < end) {
    const next = cursor.plus({ [bucketUnit]: bucketValue });
    intervals.push(Interval.fromDateTimes(cursor, next));
    cursor = next;
  }
  return intervals;
};

const createBuckets = (intervals: Interval[], migrations: V1beta1Migration[]) => {
  return intervals.map((interval) => {
    // Find migrations that fit the bucket interval
    const inBucket = migrations.filter((migration) => {
      const started = getMigrationStarted(migration);
      const dt = DateTime.fromISO(started).toUTC();
      return interval.contains(dt);
    });

    // Group by plan, keep only the most recent (by migration started) per plan
    const latestByPlan = new Map<string, V1beta1Migration>();
    inBucket.forEach((migration) => {
      const planKey = getPlanKey(migration);
      const started = getMigrationStarted(migration);
      if (
        !latestByPlan.has(planKey) ||
        DateTime.fromISO(started) >
          DateTime.fromISO(getMigrationStarted(latestByPlan.get(planKey)!))
      ) {
        latestByPlan.set(planKey, migration);
      }
    });

    return {
      interval,
      migrations: Array.from(latestByPlan.values()),
    };
  });
};

const isCanceled = (vm: V1beta1MigrationStatusVms) =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Canceled');
const isFailed = (vm: V1beta1MigrationStatusVms) =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Failed');
const isSucceeded = (vm: V1beta1MigrationStatusVms) =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Succeeded');
const isRunning = (vm: V1beta1MigrationStatusVms) =>
  !isFailed(vm) && !isSucceeded(vm) && !isCanceled(vm) && vm?.phase !== 'Completed';

export const useVmMigrationsDataPoints = (
  selectedRange: TimeRangeOptions,
  singleBucket = false,
) => {
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

  // 1. Create interval buckets
  const intervals = createTimeBuckets(selectedRange, singleBucket);

  // 2. Group migrations into interval buckets, keeping only the latest per plan in each bucket
  const buckets = createBuckets(intervals, migrations);

  // 3. For each bucket, count failed/running/succeeded VMs
  const failed: MigrationDataPoint[] = [];
  const running: MigrationDataPoint[] = [];
  const succeeded: MigrationDataPoint[] = [];
  const canceled: MigrationDataPoint[] = [];
  let total = 0;
  let totalFailedCount = 0;
  let totalRunningCount = 0;
  let totalSucceededCount = 0;
  let totalCanceledCount = 0;

  buckets.forEach(({ interval, migrations: migrationsInBucket }) => {
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

    migrationsInBucket.forEach((migration) => {
      const name = getName(migration) ?? '';
      (migration?.status?.vms ?? []).forEach((vm) => {
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
      });
    });

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
  });

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
