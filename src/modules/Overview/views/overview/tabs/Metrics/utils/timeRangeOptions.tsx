import { DateTime } from 'luxon';

const isLast7Days = (date: DateTime) => date.diffNow('days').get('days') <= 7;
const isLast31Days = (date: DateTime) => date.diffNow('days').get('days') <= 31;
const isLast24H = (date: DateTime) => date.diffNow('hours').get('hours') <= 24;

export enum TimeRangeOptions {
  Last7Days = 'Last7Days',
  Last31Days = 'Last31Days',
  Last24H = 'Last24H',
}

interface TimeRangeOptionsProperties {
  migrationsLabelKey: string;
  vmMigrationsLabelKey: string;
  span: { days: number } | { hours: number };
  bucket: { day: number } | { hour: number };
  unit: 'day' | 'hour';
  filter: (date: DateTime) => boolean;
}

export const TimeRangeOptionsDictionary: {
  Last7Days: TimeRangeOptionsProperties;
  Last31Days: TimeRangeOptionsProperties;
  Last24H: TimeRangeOptionsProperties;
} = {
  Last7Days: {
    // t('Migrations (last 7 days)')
    migrationsLabelKey: 'Migrations (last 7 days)',
    // t('Virtual Machine Migrations (last 7 days)')
    vmMigrationsLabelKey: 'Virtual Machine Migrations (last 7 days)',
    span: { days: 7 },
    bucket: { day: 1 },
    unit: 'day',
    filter: isLast7Days,
  },
  Last31Days: {
    // t('Migrations (last 31 days)')
    migrationsLabelKey: 'Migrations (last 31 days)',
    // t('Virtual Machine Migrations (last 31 days)')
    vmMigrationsLabelKey: 'Virtual Machine Migrations (last 31 days)',
    span: { days: 31 },
    bucket: { day: 4 },
    unit: 'day',
    filter: isLast31Days,
  },
  Last24H: {
    // t('Migrations (last 24 hours)')
    migrationsLabelKey: 'Migrations (last 24 hours)',
    // t('Virtual Machine Migrations (last 24 hours)')
    vmMigrationsLabelKey: 'Virtual Machine Migrations (last 24 hours)',
    span: { hours: 24 },
    bucket: { hour: 4 },
    unit: 'hour',
    filter: isLast24H,
  },
};
