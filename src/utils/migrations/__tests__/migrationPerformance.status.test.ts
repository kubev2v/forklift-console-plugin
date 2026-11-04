import { getMigrationPerformance } from '../migrationPerformance';

import {
  buildMigrationSource,
  PERFORMANCE_META,
  toTimestamp,
} from './migrationPerformance.fixtures';

describe('getMigrationPerformance status', () => {
  it('labels mixed outcomes as Partial', () => {
    const result = getMigrationPerformance(
      buildMigrationSource(
        [
          { conditions: [{ status: 'True', type: 'Succeeded' }], id: 'a' },
          { conditions: [{ status: 'True', type: 'Failed' }], id: 'b' },
        ],
        '2026-01-01T00:00:00Z',
        '2026-01-01T01:00:00Z',
      ),
      PERFORMANCE_META,
    );

    expect(result.status).toBe('Partial');
    expect(result.copiedBytes).toBe(0);
    expect(result.avgTransferRate).toBeUndefined();
  });

  it('reports a fully failed run as Failed', () => {
    const result = getMigrationPerformance(
      buildMigrationSource(
        [{ conditions: [{ status: 'True', type: 'Failed' }], id: 'a' }],
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:30:00Z',
      ),
      PERFORMANCE_META,
    );

    expect(result.status).toBe('Failed');
  });

  it('has no rate when there is no disk data', () => {
    const result = getMigrationPerformance(
      buildMigrationSource(
        [{ conditions: [{ status: 'True', type: 'Succeeded' }], id: 'live' }],
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:08:00Z',
      ),
      PERFORMANCE_META,
    );

    expect(result.copiedBytes).toBe(0);
    expect(result.durationSeconds).toBe(480);
    expect(result.avgTransferRate).toBeUndefined();
    expect(result.overallRate).toBeUndefined();
  });

  it('uses the canceled condition time instead of now', () => {
    const result = getMigrationPerformance(
      {
        conditions: [
          { lastTransitionTime: '2026-01-01T00:10:00Z', status: 'True', type: 'Canceled' },
        ],
        started: '2026-01-01T00:00:00Z',
        vms: [{ conditions: [{ status: 'True', type: 'Canceled' }], id: 'a' }],
      },
      PERFORMANCE_META,
      toTimestamp('2026-01-01T05:00:00Z'),
    );

    expect(result.status).toBe('Canceled');
    expect(result.durationSeconds).toBe(600);
  });

  it('has no duration for a canceled run without a completed timestamp or canceled condition', () => {
    const result = getMigrationPerformance(
      {
        started: '2026-01-01T00:00:00Z',
        vms: [{ conditions: [{ status: 'True', type: 'Canceled' }], id: 'a' }],
      },
      PERFORMANCE_META,
      toTimestamp('2026-01-01T05:00:00Z'),
    );

    expect(result.status).toBe('Canceled');
    expect(result.durationSeconds).toBeUndefined();
  });

  it('reports a queued run as Pending instead of Running', () => {
    const result = getMigrationPerformance(
      buildMigrationSource([{ conditions: [], id: 'a' }], '2026-01-01T00:00:00Z'),
      PERFORMANCE_META,
      toTimestamp('2026-01-01T01:00:00Z'),
    );

    expect(result.status).toBe('Pending');
    expect(result.durationSeconds).toBeUndefined();
  });
});
