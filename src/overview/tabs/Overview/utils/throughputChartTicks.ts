import { THROUGHPUT_TIME_RANGE_CONFIG, type ThroughputTimeRange } from './throughputTimeRanges';

type ChartDatum = {
  x: number;
  y: number;
};

type ChartLineEntry = {
  data: ChartDatum[];
};

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

const TIME_TICK_INTERVALS: Record<ThroughputTimeRange, number> = {
  Last1H: 10 * MS_PER_MINUTE,
  Last24H: 4 * MS_PER_HOUR,
  Last2D: 12 * MS_PER_HOUR,
  Last30Min: 5 * MS_PER_MINUTE,
  Last6H: MS_PER_HOUR,
  Last7D: 24 * MS_PER_HOUR,
};

const TARGET_TICK_COUNT = 5;
const BYTES_DIVISOR = 1024;
const MS_PER_SECOND = 1000;

export const computeTimeTicks = (
  domain: [number, number],
  timeRange: ThroughputTimeRange,
): number[] => {
  const interval = TIME_TICK_INTERVALS[timeRange];
  const start = Math.ceil(domain[0] / interval) * interval;
  const ticks: number[] = [];

  for (let ts = start; ts <= domain[1]; ts += interval) {
    ticks.push(ts);
  }

  return ticks;
};

export const computeNiceTicks = (data: ChartLineEntry[]): number[] => {
  let max = 0;

  for (const entry of data) {
    for (const datum of entry.data) {
      if (datum.y > max) {
        max = datum.y;
      }
    }
  }

  if (max === 0) {
    return [0];
  }

  let displayMax = max;
  let unitMultiplier = 1;

  while (displayMax >= BYTES_DIVISOR) {
    displayMax /= BYTES_DIVISOR;
    unitMultiplier *= BYTES_DIVISOR;
  }

  const rough = displayMax / TARGET_TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;

  let step = 10 * magnitude;

  if (residual <= 1) {
    step = magnitude;
  } else if (residual <= 2) {
    step = 2 * magnitude;
  } else if (residual <= 5) {
    step = 5 * magnitude;
  }

  const ticks: number[] = [];

  for (let val = 0; val <= displayMax; val += step) {
    ticks.push(Math.round(val * unitMultiplier));
  }

  if (ticks[ticks.length - 1] < max) {
    ticks.push(Math.round((ticks[ticks.length - 1] / unitMultiplier + step) * unitMultiplier));
  }

  return ticks;
};

export const computeStepSeconds = (timeRange: ThroughputTimeRange): number => {
  const config = THROUGHPUT_TIME_RANGE_CONFIG[timeRange];
  return Math.round(config.timespan / (config.samples * MS_PER_SECOND));
};
