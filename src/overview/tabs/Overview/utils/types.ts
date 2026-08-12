import type { Interval } from 'luxon';

export type ChartDatum = {
  x: string;
  y: number;
};

export type ChartDatumWithName = ChartDatum & {
  interval: Interval<true> | Interval<false>;
  name: string;
};

export type MigrationDataPoint = {
  dateLabel: string;
  interval: Interval<true> | Interval<false>;
  migrations: string[];
  value: number;
};
