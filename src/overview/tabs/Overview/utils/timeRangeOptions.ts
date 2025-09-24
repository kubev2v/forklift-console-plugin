import { DateTime } from 'luxon';

import { t } from '@utils/i18n';

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

export const valueToLabel = {
  [TimeRangeOptions.All]: t('All'),
  [TimeRangeOptions.Last10Days]: t('Last 10 days'),
  [TimeRangeOptions.Last24H]: t('Last 24 hours'),
  [TimeRangeOptions.Last31Days]: t('Last 31 days'),
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
    span: { days: 365 * 10 - 1 },
    unit: 'day',
  },
  Last10Days: {
    bucket: { day: 1 },
    filter: isLast10Days,
    span: { days: 9 },
    unit: 'day',
  },
  Last24H: {
    bucket: { hour: 1 },
    filter: isLast24H,
    span: { hours: 23 },
    unit: 'hour',
  },
  Last31Days: {
    bucket: { day: 1 },
    filter: isLast31Days,
    span: { days: 30 },
    unit: 'day',
  },
};
