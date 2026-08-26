import { DateTime } from 'luxon';

import { getVmCounts } from '../getVmCounts';
import { TimeRangeOptions } from '../timeRangeOptions';

import { makeMigration, makeVm, mixedMigrations, now, recentStart } from './getVmCounts.fixtures';

describe('getVmCounts - phases', () => {
  beforeEach(() => {
    jest.spyOn(DateTime, 'now').mockReturnValue(now as DateTime<true>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('counts running, succeeded, failed, and canceled VMs', () => {
    const counts = getVmCounts(mixedMigrations, TimeRangeOptions.All);

    expect(counts).toEqual({
      Canceled: 1,
      Failed: 1,
      Running: 1,
      Succeeded: 2,
      Total: 5,
    });
  });

  it('ignores False conditions and empty migrations', () => {
    const migrations = [
      makeMigration(
        'false-cond',
        [
          makeVm('Completed', [{ status: 'False', type: 'Failed' }], {
            completed: recentStart,
          }),
          makeVm('Completed', [], { completed: recentStart }),
        ],
        recentStart,
      ),
    ];

    expect(getVmCounts(migrations, TimeRangeOptions.All)).toEqual({
      Canceled: 0,
      Failed: 0,
      Running: 0,
      Succeeded: 0,
      Total: 2,
    });
    expect(getVmCounts([], TimeRangeOptions.All).Total).toBe(0);
    expect(getVmCounts(undefined as never, TimeRangeOptions.All).Total).toBe(0);
  });

  it('treats non-completed failed/canceled as not running', () => {
    const migrations = [
      makeMigration(
        'active-fail',
        [makeVm('CopyingDisks', [{ status: 'True', type: 'Failed' }], { started: recentStart })],
        recentStart,
      ),
    ];

    expect(getVmCounts(migrations, TimeRangeOptions.All)).toEqual({
      Canceled: 0,
      Failed: 0,
      Running: 0,
      Succeeded: 0,
      Total: 1,
    });
  });
});
