import type { DateTime } from 'luxon';

import { t } from '@utils/i18n';

const isLast7Days = (date: DateTime) => date.diffNow('days').get('days') <= 7;
const isLast31Days = (date: DateTime) => date.diffNow('days').get('days') <= 31;
const isLast24H = (date: DateTime) => date.diffNow('hours').get('hours') <= 24;

export enum TimeRangeOptions {
  Last7Days = 'Last7Days',
  Last31Days = 'Last31Days',
  Last24H = 'Last24H',
}

type TimeRangeOptionsProperties = {
  migrationsLabelKey: string;
  vmMigrationsLabelKey: string;
  span: { days: number } | { hours: number };
  bucket: { day: number } | { hour: number };
  unit: 'day' | 'hour';
  filter: (date: DateTime) => boolean;
};

export const TimeRangeOptionsDictionary: {
  Last7Days: TimeRangeOptionsProperties;
  Last31Days: TimeRangeOptionsProperties;
  Last24H: TimeRangeOptionsProperties;
} = {
  Last24H: {
    bucket: { hour: 4 },
    filter: isLast24H,
    migrationsLabelKey: t('Migrations (last 24 hours)'),
    span: { hours: 24 },
    unit: 'hour',
    vmMigrationsLabelKey: t('Virtual Machine Migrations (last 24 hours)'),
  },
  Last31Days: {
    bucket: { day: 4 },
    filter: isLast31Days,
    migrationsLabelKey: t('Migrations (last 31 days)'),
    span: { days: 31 },
    unit: 'day',
    vmMigrationsLabelKey: t('Virtual Machine Migrations (last 31 days)'),
  },
  Last7Days: {
    bucket: { day: 1 },
    filter: isLast7Days,
    migrationsLabelKey: t('Migrations (last 7 days)'),
    span: { days: 7 },
    unit: 'day',
    vmMigrationsLabelKey: t('Virtual Machine Migrations (last 7 days)'),
  },
};
