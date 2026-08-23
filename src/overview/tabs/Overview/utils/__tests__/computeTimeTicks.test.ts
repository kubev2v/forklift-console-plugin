import { computeTimeTicks } from '../throughputChartTicks';
import { ThroughputTimeRange } from '../throughputTimeRanges';

import { MS_PER_HOUR, MS_PER_MINUTE } from './throughputChartTicks.fixtures';

describe('computeTimeTicks', () => {
  test('generates ticks aligned to 5-minute intervals for Last30Min', () => {
    const baseTime = 10 * MS_PER_MINUTE;
    const domain: [number, number] = [baseTime, baseTime + 30 * MS_PER_MINUTE];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last30Min);

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick % (5 * MS_PER_MINUTE)).toBe(0);
    }
  });

  test('generates ticks aligned to 10-minute intervals for Last1H', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last1H);

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick % (10 * MS_PER_MINUTE)).toBe(0);
    }
  });

  test('generates ticks aligned to 1-hour intervals for Last6H', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 6 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last6H);

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick % MS_PER_HOUR).toBe(0);
    }
  });

  test('generates ticks aligned to 4-hour intervals for Last24H', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 24 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last24H);

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick % (4 * MS_PER_HOUR)).toBe(0);
    }
  });

  test('generates ticks aligned to 12-hour intervals for Last2D', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 48 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last2D);

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick % (12 * MS_PER_HOUR)).toBe(0);
    }
  });

  test('generates ticks aligned to 24-hour intervals for Last7D', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 7 * 24 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last7D);

    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks) {
      expect(tick % (24 * MS_PER_HOUR)).toBe(0);
    }
  });

  test('all ticks fall within the domain boundaries', () => {
    const domain: [number, number] = [MS_PER_HOUR, 7 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last6H);

    for (const tick of ticks) {
      expect(tick).toBeGreaterThanOrEqual(domain[0]);
      expect(tick).toBeLessThanOrEqual(domain[1]);
    }
  });

  test('returns empty array when domain is smaller than one interval', () => {
    const domain: [number, number] = [100, 200];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last7D);

    expect(ticks).toEqual([]);
  });

  test('handles domain starting exactly on an interval boundary', () => {
    const domain: [number, number] = [MS_PER_HOUR, 3 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last6H);

    expect(ticks[0]).toBe(MS_PER_HOUR);
  });

  test('ceils the start to the next interval if not aligned', () => {
    const domain: [number, number] = [MS_PER_HOUR + 1, 3 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last6H);

    expect(ticks[0]).toBe(2 * MS_PER_HOUR);
  });
});
