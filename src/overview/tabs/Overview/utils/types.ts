import type { Interval } from 'luxon';

export type ChartDatum = {
  x: string;
  y: number;
};

export type ChartDatumWithName = ChartDatum & {
  interval: Interval;
  name: string;
};

export type MigrationDataPoint = {
  dateLabel: string;
  interval: Interval;
  migrations: string[];
  value: number;
};
