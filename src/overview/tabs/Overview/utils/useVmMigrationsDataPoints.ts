import { DateTime, Interval } from 'luxon';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1MigrationStatusVms,
  type V1beta1MigrationStatusVmsConditions,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';
// import type { MigrationDataPoint } from './utils/toDataPointsHelper';

type MigrationDataPoint = {
  dateLabel: string;
  value: number;
};

const getPlanKey = (migration: V1beta1Migration) => {
  const plan = migration?.spec?.plan;
  return (
    plan?.uid || (plan?.namespace && plan?.name ? `${plan.namespace}/${plan.name}` : 'unknown-plan')
  );
};

const getMigrationStarted = (migration: V1beta1Migration) =>
  migration?.status?.started ?? migration?.metadata?.creationTimestamp ?? '1970-01-01T00:00:00Z';

const toHourLabel = (date: DateTime | null) => (date ? date.toUTC().toFormat('HH:mm') : '');
const toDayLabel = (date: DateTime | null) => (date ? date.toUTC().toFormat('LLL dd') : '');

const createTimeBuckets = (selectedTimeRange: TimeRangeOptions) => {
  const { bucket, span, unit } = TimeRangeOptionsDictionary[selectedTimeRange];
  const now = DateTime.now().toUTC();
  const start = now.minus(span).startOf(unit);

  let bucketUnit: 'hour' | 'day';
  let bucketValue: number;
  if ('hour' in bucket) {
    bucketUnit = 'hour';
    bucketValue = bucket.hour;
  } else {
    bucketUnit = 'day';
    bucketValue = bucket.day;
  }

  let end = now.plus({ [bucketUnit]: bucketValue }).startOf(bucketUnit);
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
  return intervals.slice(-12);
};

const isCanceled = (vm: V1beta1MigrationStatusVms) =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Canceled');
const isFailed = (vm: V1beta1MigrationStatusVms) =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Failed');
const isSucceeded = (vm: V1beta1MigrationStatusVms) =>
  vm?.conditions?.some((cond: V1beta1MigrationStatusVmsConditions) => cond?.type === 'Succeeded');
const isRunning = (vm: V1beta1MigrationStatusVms) =>
  !isFailed(vm) && !isSucceeded(vm) && !isCanceled(vm) && vm?.phase !== 'Completed';

export const useVmMigrationsDataPoints = (selectedRange: TimeRangeOptions) => {
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
    };
  }

  // 1. Create interval buckets
  const intervals = createTimeBuckets(selectedRange);

  // 2. Group migrations into interval buckets, keeping only the latest per plan in each bucket
  const buckets = intervals.map((interval) => {
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

    migrationsInBucket.forEach((migration) => {
      (migration?.status?.vms ?? []).forEach((vm) => {
        total += 1;
        if (isFailed(vm)) {
          failedCount += 1;
          totalFailedCount += 1;
        } else if (isSucceeded(vm)) {
          succeededCount += 1;
          totalSucceededCount += 1;
        } else if (isRunning(vm)) {
          runningCount += 1;
          totalRunningCount += 1;
        } else if (isCanceled(vm)) {
          canceledCount += 1;
          totalCanceledCount += 1;
        }
      });
    });

    const dateLabel =
      selectedRange === TimeRangeOptions.Last24H
        ? toHourLabel(interval.start)
        : toDayLabel(interval.start);

    failed.push({ dateLabel, value: failedCount });
    running.push({ dateLabel, value: runningCount });
    succeeded.push({ dateLabel, value: succeededCount });
    canceled.push({ dateLabel, value: canceledCount });
  });

  return {
    canceled,
    failed,
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
