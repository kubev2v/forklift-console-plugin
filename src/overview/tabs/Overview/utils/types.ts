import type { Interval } from 'luxon';

export type ChartDatum = {
  x: string;
  y: number;
};

export type ChartDatumWithName = ChartDatum & {
  name: string;
  interval: Interval;
};

export type MigrationDataPoint = {
  dateLabel: string;
  value: number;
  interval: Interval;
  migrations: string[];
};
