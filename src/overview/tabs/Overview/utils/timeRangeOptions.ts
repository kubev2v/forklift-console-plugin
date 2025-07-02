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

const BUCKET_SM_HOURS = 2;
const BUCKET_MD_DAYS = 1;
const BUCKET_LARGE_DAYS = 4;

export const TimeRangeOptionsDictionary: {
  Last10Days: TimeRangeOptionsProperties;
  Last31Days: TimeRangeOptionsProperties;
  Last24H: TimeRangeOptionsProperties;
  All: TimeRangeOptionsProperties;
} = {
  All: {
    bucket: { day: BUCKET_LARGE_DAYS },
    filter: () => true,
    span: { days: 365 * 10 },
    unit: 'day',
  },
  Last10Days: {
    bucket: { day: BUCKET_MD_DAYS },
    filter: isLast10Days,
    span: { days: 10 },
    unit: 'day',
  },
  Last24H: {
    bucket: { hour: BUCKET_SM_HOURS },
    filter: isLast24H,
    span: { hours: 24 },
    unit: 'hour',
  },
  Last31Days: {
    bucket: { day: BUCKET_LARGE_DAYS },
    filter: isLast31Days,
    span: { days: 31 },
    unit: 'day',
  },
};
