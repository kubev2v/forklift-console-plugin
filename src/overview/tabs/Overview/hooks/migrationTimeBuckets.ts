import { DateTime, Interval } from 'luxon';
import { getMigrationStarted, getPlanKey } from 'src/overview/utils/utils';

import type { V1beta1Migration } from '@forklift-ui/types';

import type { TimeRangeOptions } from '../utils/timeRangeOptions';
import { TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';

export const toHourLabel = (date: DateTime | null): string =>
  date ? date.toLocal().toFormat('LLL dd HH:mm') : '';

export const toDayLabel = (date: DateTime | null): string =>
  date ? date.toLocal().toFormat('LLL dd') : '';

export const createTimeBuckets = (
  selectedTimeRange: TimeRangeOptions,
  singleBucket = false,
): Interval[] => {
  const { bucket, span, unit } = TimeRangeOptionsDictionary[selectedTimeRange];
  const now = DateTime.now().endOf(unit).toUTC();
  const start = now.minus(span).startOf(unit);
  let end = now;

  if (singleBucket) {
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

export const createBuckets = (
  intervals: Interval[],
  migrations: V1beta1Migration[],
): { interval: Interval; migrations: V1beta1Migration[] }[] => {
  return intervals.map((interval) => {
    const inBucket = migrations.filter((migration) => {
      const started = getMigrationStarted(migration);
      const dt = DateTime.fromISO(started).toUTC();
      return interval.contains(dt);
    });

    const latestByPlan = new Map<string, V1beta1Migration>();
    for (const migration of inBucket) {
      const planKey = getPlanKey(migration);
      const started = getMigrationStarted(migration);
      const prev = latestByPlan.get(planKey);
      if (!prev || DateTime.fromISO(started) > DateTime.fromISO(getMigrationStarted(prev))) {
        latestByPlan.set(planKey, migration);
      }
    }

    return {
      interval,
      migrations: Array.from(latestByPlan.values()),
    };
  });
};
