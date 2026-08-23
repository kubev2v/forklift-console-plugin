import { computeStepSeconds } from '../throughputChartTicks';
import { ThroughputTimeRange } from '../throughputTimeRanges';

describe('computeStepSeconds', () => {
  test('computes correct step for Last30Min (30 samples over 30 min)', () => {
    const step = computeStepSeconds(ThroughputTimeRange.Last30Min);

    expect(step).toBe(60);
  });

  test('computes correct step for Last1H (60 samples over 1 hour)', () => {
    const step = computeStepSeconds(ThroughputTimeRange.Last1H);

    expect(step).toBe(60);
  });

  test('computes correct step for Last6H (72 samples over 6 hours)', () => {
    const step = computeStepSeconds(ThroughputTimeRange.Last6H);

    expect(step).toBe(300);
  });

  test('computes correct step for Last24H (96 samples over 24 hours)', () => {
    const step = computeStepSeconds(ThroughputTimeRange.Last24H);

    expect(step).toBe(900);
  });

  test('computes correct step for Last2D (96 samples over 2 days)', () => {
    const step = computeStepSeconds(ThroughputTimeRange.Last2D);

    expect(step).toBe(1800);
  });

  test('computes correct step for Last7D (168 samples over 7 days)', () => {
    const step = computeStepSeconds(ThroughputTimeRange.Last7D);

    expect(step).toBe(3600);
  });

  test('all step values are positive integers', () => {
    const ranges = Object.values(ThroughputTimeRange);

    for (const range of ranges) {
      const step = computeStepSeconds(range);
      expect(step).toBeGreaterThan(0);
      expect(Number.isInteger(step)).toBe(true);
    }
  });
});
