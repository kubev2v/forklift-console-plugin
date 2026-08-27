import { DateTime } from 'luxon';

import type { V1beta1Migration } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { TimeRangeOptions } from '../../utils/timeRangeOptions';
import { useVmMigrationsDataPoints } from '../useVmMigrationsDataPoints';

jest.mock('@utils/hooks/useK8sWatchResource', (): unknown => ({
  useK8sWatchResource: jest.fn(),
}));

const mockWatch = useK8sWatchResource as jest.MockedFunction<typeof useK8sWatchResource>;
const bucketNow = DateTime.utc(2026, 8, 26, 12, 0, 0);
const recentIso = bucketNow.minus({ hours: 1 }).toISO() ?? '';

const statusMigrations: V1beta1Migration[] = [
  {
    metadata: { name: 'mig-mixed', namespace: 'ns', creationTimestamp: recentIso },
    spec: { plan: { name: 'plan-a', namespace: 'ns', uid: 'plan-a' } },
    status: {
      started: recentIso,
      vms: [
        { conditions: [{ type: 'Succeeded' }], phase: 'Completed' },
        { conditions: [{ type: 'Failed' }], phase: 'Completed' },
        { conditions: [{ type: 'Canceled' }], phase: 'Completed' },
        { phase: 'CopyingDisks' },
      ],
    },
  } as unknown as V1beta1Migration,
  {
    metadata: { name: 'mig-dup', namespace: 'ns', creationTimestamp: recentIso },
    spec: { plan: { name: 'plan-a', namespace: 'ns', uid: 'plan-a' } },
    status: {
      started: bucketNow.minus({ minutes: 30 }).toISO() ?? '',
      vms: [{ conditions: [{ type: 'Succeeded' }], phase: 'Completed' }],
    },
  } as unknown as V1beta1Migration,
];

describe('useVmMigrationsDataPoints - aggregation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(DateTime, 'now').mockReturnValue(bucketNow as DateTime<true>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty totals while loading', () => {
    mockWatch.mockReturnValue([[], false, undefined] as never);

    const { result } = renderHook(() => useVmMigrationsDataPoints(TimeRangeOptions.Last24H, true));

    expect(result.current).toMatchObject({
      loaded: false,
      total: 0,
      totalCanceledCount: 0,
      totalFailedCount: 0,
      totalRunningCount: 0,
      totalSucceededCount: 0,
    });
    expect(result.current.succeeded).toEqual([]);
  });

  it('aggregates VM statuses into single-bucket totals', () => {
    mockWatch.mockReturnValue([statusMigrations, true, null] as never);

    const { result } = renderHook(() => useVmMigrationsDataPoints(TimeRangeOptions.Last24H, true));

    // Latest migration for plan-a wins (mig-dup), so only its VMs count.
    expect(result.current.loaded).toBe(true);
    expect(result.current.total).toBe(1);
    expect(result.current.totalSucceededCount).toBe(1);
    expect(result.current.totalFailedCount).toBe(0);
    expect(result.current.succeeded[0]).toMatchObject({
      migrations: ['mig-dup'],
      value: 1,
    });
  });

  it('counts all statuses when migrations are distinct plans', () => {
    const distinct = [
      statusMigrations[0],
      {
        ...statusMigrations[1],
        metadata: { ...statusMigrations[1].metadata, name: 'mig-other' },
        spec: { plan: { name: 'plan-b', namespace: 'ns', uid: 'plan-b' } },
      },
    ];
    mockWatch.mockReturnValue([distinct, true, null] as never);

    const { result } = renderHook(() => useVmMigrationsDataPoints(TimeRangeOptions.Last24H, true));

    expect(result.current.total).toBe(5);
    expect(result.current.totalSucceededCount).toBe(2);
    expect(result.current.totalFailedCount).toBe(1);
    expect(result.current.totalCanceledCount).toBe(1);
    expect(result.current.totalRunningCount).toBe(1);
  });

  it('propagates loadError when watch fails', () => {
    const err = new Error('watch failed');
    mockWatch.mockReturnValue([[], true, err] as never);

    const { result } = renderHook(() => useVmMigrationsDataPoints(TimeRangeOptions.All, true));

    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBe(err);
  });

  it('counts Failed by condition type even when status is False', () => {
    mockWatch.mockReturnValue([
      [
        {
          metadata: { name: 'mig-false', namespace: 'ns', creationTimestamp: recentIso },
          spec: { plan: { name: 'plan-f', namespace: 'ns', uid: 'plan-f' } },
          status: {
            started: recentIso,
            vms: [{ conditions: [{ status: 'False', type: 'Failed' }], phase: 'Completed' }],
          },
        },
      ],
      true,
      null,
    ] as never);

    const { result } = renderHook(() => useVmMigrationsDataPoints(TimeRangeOptions.Last24H, true));

    expect(result.current.totalFailedCount).toBe(1);
    expect(result.current.total).toBe(1);
  });
});
