import { DateTime } from 'luxon';

const isLast24H = (date: DateTime) => DateTime.now().toUTC().diff(date, 'hours').hours <= 24;
const isLast10Days = (date: DateTime) => DateTime.now().toUTC().diff(date, 'days').days <= 10;
const isLast31Days = (date: DateTime) => DateTime.now().toUTC().diff(date, 'days').days <= 31;

export enum TimeRangeOptions {
  Last10Days = 'Last10Days',
  Last31Days = 'Last31Days',
  Last24H = 'Last24H',
  All = 'All',
}

type TimeRangeOptionsProperties = {
  span: { days: number } | { hours: number };
  bucket: { day: number } | { hour: number };
  unit: 'day' | 'hour';
  filter: (date: DateTime) => boolean;
};

export const TimeRangeOptionsDictionary: {
  Last10Days: TimeRangeOptionsProperties;
  Last31Days: TimeRangeOptionsProperties;
  Last24H: TimeRangeOptionsProperties;
  All: TimeRangeOptionsProperties;
} = {
  All: {
    bucket: { day: 1 },
    filter: () => true,
    span: { days: 365 },
    unit: 'day',
  },
  Last10Days: {
    bucket: { day: 1 },
    filter: isLast10Days,
    span: { days: 10 },
    unit: 'day',
  },
  Last24H: {
    bucket: { hour: 2 },
    filter: isLast24H,
    span: { hours: 24 },
    unit: 'hour',
  },
  Last31Days: {
    bucket: { day: 4 },
    filter: isLast31Days,
    span: { days: 31 },
    unit: 'day',
  },
};
