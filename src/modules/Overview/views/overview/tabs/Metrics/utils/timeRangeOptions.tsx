import type { DateTime } from 'luxon';

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
    // T('Migrations (last 24 hours)')
    migrationsLabelKey: 'Migrations (last 24 hours)',
    span: { hours: 24 },
    unit: 'hour',
    // T('Virtual Machine Migrations (last 24 hours)')
    vmMigrationsLabelKey: 'Virtual Machine Migrations (last 24 hours)',
  },
  Last31Days: {
    bucket: { day: 4 },
    filter: isLast31Days,
    // T('Migrations (last 31 days)')
    migrationsLabelKey: 'Migrations (last 31 days)',
    span: { days: 31 },
    unit: 'day',
    // T('Virtual Machine Migrations (last 31 days)')
    vmMigrationsLabelKey: 'Virtual Machine Migrations (last 31 days)',
  },
  Last7Days: {
    bucket: { day: 1 },
    filter: isLast7Days,
    // T('Migrations (last 7 days)')
    migrationsLabelKey: 'Migrations (last 7 days)',
    span: { days: 7 },
    unit: 'day',
    // T('Virtual Machine Migrations (last 7 days)')
    vmMigrationsLabelKey: 'Virtual Machine Migrations (last 7 days)',
  },
};
