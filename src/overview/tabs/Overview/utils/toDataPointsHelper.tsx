import { DateTime, Interval } from 'luxon';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

const hasTimestamp = (timestamp: string) => timestamp && DateTime.fromISO(timestamp).isValid;
const toDateTime = (timestamp: string): DateTime => DateTime.fromISO(timestamp);
const toDayLabel = (date: DateTime | null): string =>
  date?.toLocal().toFormat('LLL dd') ?? 'Jan 01';
const toHourLabel = (date: DateTime | null): string => date?.toLocal().toFormat('HH:mm') ?? '00:00';

export type MigrationDataPoint = {
  dateLabel: string;
  value: number;
};

const groupByBucket = (acc: { interval: Interval; points: DateTime[] }[], date: DateTime) =>
  acc.map(({ interval, points }) =>
    interval.contains(date) ? { interval, points: [...points, date] } : { interval, points },
  );

const createTimeBuckets = (selectedTimeRange: TimeRangeOptions) =>
  Interval.fromDateTimes(
    DateTime.now()
      .toUTC()
      .minus(TimeRangeOptionsDictionary[selectedTimeRange].span)
      // adjust the time window granularity i.e.
      // assume 24h window and current time 14:30
      // event that happened at 14:10 on the previous day is older then 24h when calculated with minute-precision
      // but should be included with hour-precision (as we show on the chart)
      .startOf(TimeRangeOptionsDictionary[selectedTimeRange].unit),
    DateTime.now().toUTC().endOf(TimeRangeOptionsDictionary[selectedTimeRange].unit),
  )
    .splitBy(TimeRangeOptionsDictionary[selectedTimeRange].bucket)
    .map((interval) => ({ interval, points: [] }));

export const toDataPoints = (
  filteredMigrations: string[],
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] => {
  const timePoints = filteredMigrations
    .filter(hasTimestamp)
    .map(toDateTime)
    .filter(TimeRangeOptionsDictionary[selectedTimeRange].filter);

  const timeBuckets = timePoints.reduce(groupByBucket, createTimeBuckets(selectedTimeRange));

  return timeBuckets.map(({ interval, points }) => ({
    dateLabel:
      selectedTimeRange === TimeRangeOptions.Last24H
        ? toHourLabel(interval.start)
        : toDayLabel(interval.start),
    value: points.length,
  }));
};
