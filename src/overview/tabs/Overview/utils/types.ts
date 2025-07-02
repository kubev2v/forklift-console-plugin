export type ChartDatum = {
  x: string;
  y: number;
};

export type ChartDatumWithName = ChartDatum & {
  name: string;
};
