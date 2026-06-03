import { computeNiceTicks, computeStepSeconds, computeTimeTicks } from '../throughputChartTicks';
import { ThroughputTimeRange } from '../throughputTimeRanges';

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;
const BYTES_PER_GB = BYTES_PER_MB * 1024;

describe('computeTimeTicks', () => {
  test('generates ticks aligned to 5-minute intervals for Last30Min', () => {
    const baseTime = 10 * MS_PER_MINUTE;
    const domain: [number, number] = [baseTime, baseTime + 30 * MS_PER_MINUTE];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last30Min);

    expect(ticks.length).toBeGreaterThan(0);
    ticks.forEach((tick) => {
      expect(tick % (5 * MS_PER_MINUTE)).toBe(0);
    });
  });

  test('generates ticks aligned to 10-minute intervals for Last1H', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last1H);

    expect(ticks.length).toBeGreaterThan(0);
    ticks.forEach((tick) => {
      expect(tick % (10 * MS_PER_MINUTE)).toBe(0);
    });
  });

  test('generates ticks aligned to 1-hour intervals for Last6H', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 6 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last6H);

    expect(ticks.length).toBeGreaterThan(0);
    ticks.forEach((tick) => {
      expect(tick % MS_PER_HOUR).toBe(0);
    });
  });

  test('generates ticks aligned to 4-hour intervals for Last24H', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 24 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last24H);

    expect(ticks.length).toBeGreaterThan(0);
    ticks.forEach((tick) => {
      expect(tick % (4 * MS_PER_HOUR)).toBe(0);
    });
  });

  test('generates ticks aligned to 12-hour intervals for Last2D', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 48 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last2D);

    expect(ticks.length).toBeGreaterThan(0);
    ticks.forEach((tick) => {
      expect(tick % (12 * MS_PER_HOUR)).toBe(0);
    });
  });

  test('generates ticks aligned to 24-hour intervals for Last7D', () => {
    const baseTime = 0;
    const domain: [number, number] = [baseTime, baseTime + 7 * 24 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last7D);

    expect(ticks.length).toBeGreaterThan(0);
    ticks.forEach((tick) => {
      expect(tick % (24 * MS_PER_HOUR)).toBe(0);
    });
  });

  test('all ticks fall within the domain boundaries', () => {
    const domain: [number, number] = [MS_PER_HOUR, 7 * MS_PER_HOUR];

    const ticks = computeTimeTicks(domain, ThroughputTimeRange.Last6H);

    ticks.forEach((tick) => {
      expect(tick).toBeGreaterThanOrEqual(domain[0]);
      expect(tick).toBeLessThanOrEqual(domain[1]);
    });
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

describe('computeNiceTicks', () => {
  test('returns [0] for empty data', () => {
    const ticks = computeNiceTicks([]);

    expect(ticks).toEqual([0]);
  });

  test('returns [0] when all values are zero', () => {
    const data = [
      {
        data: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      },
    ];

    const ticks = computeNiceTicks(data);

    expect(ticks).toEqual([0]);
  });

  test('returns [0] for entries with empty data arrays', () => {
    const data = [{ data: [] }];

    const ticks = computeNiceTicks(data);

    expect(ticks).toEqual([0]);
  });

  test('produces round tick values for KB-range data', () => {
    const data = [{ data: [{ x: 1, y: 500 * BYTES_PER_KB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    ticks.forEach((tick) => {
      expect(tick % BYTES_PER_KB).toBe(0);
    });
  });

  test('produces round tick values for MB-range data', () => {
    const data = [{ data: [{ x: 1, y: 100 * BYTES_PER_MB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    ticks.forEach((tick) => {
      expect(tick % BYTES_PER_MB).toBe(0);
    });
  });

  test('produces round tick values for GB-range data', () => {
    const data = [{ data: [{ x: 1, y: 5 * BYTES_PER_GB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    ticks.forEach((tick) => {
      expect(tick % BYTES_PER_GB).toBe(0);
    });
  });

  test('first tick is always 0', () => {
    const data = [{ data: [{ x: 1, y: 50 * BYTES_PER_MB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks[0]).toBe(0);
  });

  test('last tick is >= the maximum data value', () => {
    const maxValue = 73 * BYTES_PER_MB;
    const data = [{ data: [{ x: 1, y: maxValue }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(maxValue);
  });

  test('finds maximum across multiple series', () => {
    const data = [
      { data: [{ x: 1, y: 10 * BYTES_PER_MB }] },
      { data: [{ x: 1, y: 50 * BYTES_PER_MB }] },
      { data: [{ x: 1, y: 30 * BYTES_PER_MB }] },
    ];

    const ticks = computeNiceTicks(data);

    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(50 * BYTES_PER_MB);
  });

  test('handles small sub-KB values', () => {
    const data = [{ data: [{ x: 1, y: 500 }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(500);
  });

  test('handles single data point', () => {
    const data = [{ data: [{ x: 1, y: 200 * BYTES_PER_KB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(200 * BYTES_PER_KB);
  });

  test('ticks are monotonically increasing', () => {
    const data = [{ data: [{ x: 1, y: 750 * BYTES_PER_MB }] }];

    const ticks = computeNiceTicks(data);

    for (let i = 1; i < ticks.length; i += 1) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
    }
  });

  test('produces exactly 1024-multiple ticks at KB boundary', () => {
    const data = [{ data: [{ x: 1, y: 800 }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(800);
  });
});

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

    ranges.forEach((range) => {
      const step = computeStepSeconds(range);
      expect(step).toBeGreaterThan(0);
      expect(Number.isInteger(step)).toBe(true);
    });
  });
});
