import { DateTime, Settings } from 'luxon';

import type { V1beta1Migration } from '@forklift-ui/types';

import { TimeRangeOptions } from '../../utils/timeRangeOptions';
import { createBuckets, createTimeBuckets, toDayLabel, toHourLabel } from '../migrationTimeBuckets';

const makeMigration = ({
  name,
  namespace = 'ns',
  started,
  uid,
}: {
  name: string;
  namespace?: string;
  started: string;
  uid?: string;
}): V1beta1Migration =>
  ({
    metadata: { creationTimestamp: started, name, namespace },
    spec: {
      plan: uid ? { name, namespace, uid } : { name, namespace },
    },
    status: { started },
  }) as V1beta1Migration;

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

  it('creates a single bucket spanning the full Last24H window', () => {
    const buckets = createTimeBuckets(TimeRangeOptions.Last24H, true);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].start?.toUTC().toISO()).toBe('2026-08-22T12:00:00.000Z');
    expect(buckets[0].end?.toUTC().toISO()).toBe('2026-08-23T12:59:59.999Z');
  });

  it('creates 25 hourly buckets for Last24H with fixed now', () => {
    const buckets = createTimeBuckets(TimeRangeOptions.Last24H);
    expect(buckets).toHaveLength(25);
    expect(buckets[0].start?.toUTC().toISO()).toBe('2026-08-22T12:00:00.000Z');
    expect(buckets[0].end?.toUTC().toISO()).toBe('2026-08-22T13:00:00.000Z');
    expect(buckets.at(-1)?.start?.toUTC().toISO()).toBe('2026-08-23T12:00:00.000Z');
    expect(buckets.at(-1)?.end?.toUTC().toISO()).toBe('2026-08-23T13:00:00.000Z');
  });

  it('keeps only the latest migration per plan inside each bucket', () => {
    const [interval] = createTimeBuckets(TimeRangeOptions.Last24H, true);
    const older = makeMigration({
      name: 'plan-a',
      started: '2026-08-23T10:00:00.000Z',
      uid: 'plan-a-uid',
    });
    const newer = makeMigration({
      name: 'plan-a',
      started: '2026-08-23T11:00:00.000Z',
      uid: 'plan-a-uid',
    });
    const otherPlan = makeMigration({
      name: 'plan-b',
      started: '2026-08-23T10:30:00.000Z',
      uid: 'plan-b-uid',
    });

    const [bucket] = createBuckets([interval], [older, newer, otherPlan]);
    const startedTimes = bucket.migrations
      .map((migration) => migration.status?.started)
      .sort((left, right) => (left ?? '').localeCompare(right ?? ''));

    expect(bucket.migrations).toHaveLength(2);
    expect(startedTimes).toEqual(['2026-08-23T10:30:00.000Z', '2026-08-23T11:00:00.000Z']);
  });
});
