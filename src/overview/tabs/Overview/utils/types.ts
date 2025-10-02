import type { Interval } from 'luxon';

export type ChartDatum = {
  x: string;
  y: number;
};

export type ChartDatumWithName = ChartDatum & {
  name: string;
  interval: Interval<true> | Interval<false>;
};

export type MigrationDataPoint = {
  dateLabel: string;
  value: number;
  interval: Interval<true> | Interval<false>;
  migrations: string[];
};
