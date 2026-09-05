import { DateTime } from 'luxon';

import { getVmCounts } from '../getVmCounts';
import { TimeRangeOptions } from '../timeRangeOptions';

import { makeMigration, makeVm, mixedMigrations, now, recentStart } from './getVmCounts.fixtures';

describe('getVmCounts - timeRange', () => {
  beforeEach(() => {
    jest.spyOn(DateTime, 'now').mockReturnValue(now as DateTime<true>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('includes only VMs within Last24H', () => {
    const counts = getVmCounts(mixedMigrations, TimeRangeOptions.Last24H);

    expect(counts).toEqual({
      Canceled: 1,
      Failed: 1,
      Running: 1,
      Succeeded: 1,
      Total: 4,
    });
  });

  it('filters per-VM when one migration straddles the window', () => {
    const oldStart = now.minus({ days: 40 }).toISO() ?? '';
    const migrations = [
      makeMigration(
        'mixed-age',
        [
          makeVm('Completed', [{ status: 'True', type: 'Succeeded' }], {
            completed: recentStart,
            started: recentStart,
          }),
          makeVm('Completed', [{ status: 'True', type: 'Succeeded' }], {
            completed: oldStart,
            started: oldStart,
          }),
        ],
        recentStart,
      ),
    ];

    expect(getVmCounts(migrations, TimeRangeOptions.Last24H)).toEqual({
      Canceled: 0,
      Failed: 0,
      Running: 0,
      Succeeded: 1,
      Total: 1,
    });
    expect(getVmCounts(migrations, TimeRangeOptions.All).Total).toBe(2);
  });

  it('includes only VMs within Last31Days', () => {
    const counts = getVmCounts(mixedMigrations, TimeRangeOptions.Last31Days);

    expect(counts.Total).toBe(4);
    expect(counts.Succeeded).toBe(1);
  });

  it('includes all VMs for All range including old ones', () => {
    const counts = getVmCounts(mixedMigrations, TimeRangeOptions.All);

    expect(counts.Total).toBe(5);
    expect(counts.Succeeded).toBe(2);
  });

  it('skips VMs with invalid timestamps outside All', () => {
    const migrations = [
      {
        metadata: { name: 'bad-time' },
        status: {
          started: now.toISO(),
          vms: [{ phase: 'Completed', conditions: [{ status: 'True', type: 'Succeeded' }] }],
        },
      },
    ];

    expect(getVmCounts(migrations as never, TimeRangeOptions.Last24H).Total).toBe(0);
    expect(getVmCounts(migrations as never, TimeRangeOptions.All)).toEqual({
      Canceled: 0,
      Failed: 0,
      Running: 0,
      Succeeded: 1,
      Total: 1,
    });
  });
});
