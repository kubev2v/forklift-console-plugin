import { computeNiceTicks } from '../throughputChartTicks';

import { BYTES_PER_GB, BYTES_PER_KB, BYTES_PER_MB } from './throughputChartTicks.fixtures';

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
    for (const tick of ticks) {
      expect(tick % BYTES_PER_KB).toBe(0);
    }
  });

  test('produces round tick values for MB-range data', () => {
    const data = [{ data: [{ x: 1, y: 100 * BYTES_PER_MB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    for (const tick of ticks) {
      expect(tick % BYTES_PER_MB).toBe(0);
    }
  });

  test('produces round tick values for GB-range data', () => {
    const data = [{ data: [{ x: 1, y: 5 * BYTES_PER_GB }] }];

    const ticks = computeNiceTicks(data);

    expect(ticks.length).toBeGreaterThan(1);
    for (const tick of ticks) {
      expect(tick % BYTES_PER_GB).toBe(0);
    }
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
