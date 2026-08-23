import { DateTime, Settings } from 'luxon';

import { TimeRangeOptions } from '../../utils/timeRangeOptions';
import { createTimeBuckets, toDayLabel, toHourLabel } from '../migrationTimeBuckets';

describe('migrationTimeBuckets', () => {
  const fixedNow = DateTime.utc(2026, 8, 23, 12, 0, 0);

  beforeEach(() => {
    Settings.now = (): number => fixedNow.toMillis();
  });

  afterEach(() => {
    Settings.now = (): number => Date.now();
  });

  it('returns empty string labels for null dates', () => {
    expect(toHourLabel(null)).toBe('');
    expect(toDayLabel(null)).toBe('');
  });

  it('creates a single bucket when requested', () => {
    const buckets = createTimeBuckets(TimeRangeOptions.Last24H, true);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].isValid).toBe(true);
  });

  it('creates multiple hour buckets for Last24H', () => {
    const buckets = createTimeBuckets(TimeRangeOptions.Last24H);
    expect(buckets.length).toBeGreaterThan(1);
    expect(buckets.every((bucket) => bucket.isValid)).toBe(true);
  });
});
