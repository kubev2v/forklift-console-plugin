import { DateTime, Interval } from 'luxon';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

const hasTimestamp = (timestamp: string) => timestamp && DateTime.fromISO(timestamp).isValid;
const toDateTime = (timestamp: string): DateTime => DateTime.fromISO(timestamp);
const toDayLabel = (date: DateTime): string => date.toFormat('LLL dd');
const toHourLabel = (date: DateTime): string => date.toFormat('HH:mm');

export interface MigrationDataPoint {
  dateLabel: string;
  value: number;
}

const groupByBucket = (acc: [Interval, DateTime[]][], date: DateTime) =>
  acc.map(([interval, points]) =>
    interval.contains(date) ? [interval, [...points, date]] : [interval, points],
  );

const createTimeBuckets = (selectedTimeRange: TimeRangeOptions) =>
  Interval.fromDateTimes(
    DateTime.now()
      .minus(TimeRangeOptionsDictionary[selectedTimeRange].span)
      // adjust the time window granularity i.e.
      // assume 24h window and current time 14:30
      // event that happened at 14:10 on the previous day is older then 24h when calculated with minute-precision
      // but should be included with hour-precision (as we show on the chart)
      .startOf(TimeRangeOptionsDictionary[selectedTimeRange].unit),
    DateTime.now().endOf(TimeRangeOptionsDictionary[selectedTimeRange].unit),
  )
    .splitBy(TimeRangeOptionsDictionary[selectedTimeRange].bucket)
    .map((interval) => [interval, []]);

export const toDataPoints = (
  filteredMigrations: string[],
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] =>
  filteredMigrations
    .filter(hasTimestamp)
    .map(toDateTime)
    .filter(TimeRangeOptionsDictionary[selectedTimeRange].filter)
    .reduce(groupByBucket, createTimeBuckets(selectedTimeRange))
    .map(([interval, points]) => ({
      dateLabel:
        selectedTimeRange === TimeRangeOptions.Last24H
          ? toHourLabel(interval)
          : selectedTimeRange === TimeRangeOptions.Last31Days
          ? toDayLabel(interval)
          : toDayLabel(interval.start),
      value: points.length,
    }));
