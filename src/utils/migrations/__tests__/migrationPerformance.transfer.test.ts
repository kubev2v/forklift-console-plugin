import { getMigrationPerformance } from '../migrationPerformance';

import {
  buildMigrationSource,
  buildPipelineTask,
  MIB,
  PERFORMANCE_META,
} from './migrationPerformance.fixtures';

describe('getMigrationPerformance transfer window', () => {
  it('falls back to step timestamps when tasks have none', () => {
    const result = getMigrationPerformance(
      buildMigrationSource([
        {
          id: 'vm-1',
          pipeline: [
            {
              completed: '2026-01-01T00:20:00Z',
              name: 'DiskTransferV2v',
              started: '2026-01-01T00:00:00Z',
              tasks: [buildPipelineTask('DiskTransferV2v', undefined, undefined, 100, 100)],
            },
          ],
        },
      ]),
      PERFORMANCE_META,
    );

    expect(result.transferSeconds).toBe(1200);
    expect(result.avgTransferRate).toBeCloseTo((100 * MIB) / 1200);
  });

  it('does not fall back to the run duration when copy time is unknown', () => {
    const result = getMigrationPerformance(
      buildMigrationSource([{ id: 'vm-1' }], '2026-01-01T00:00:00Z', '2026-01-01T01:00:00Z'),
      PERFORMANCE_META,
    );

    expect(result.durationSeconds).toBe(3600);
    expect(result.transferSeconds).toBeUndefined();
    expect(result.avgTransferRate).toBeUndefined();
  });

  it('uses a task start with a step completion when the step start is missing', () => {
    const result = getMigrationPerformance(
      buildMigrationSource([
        {
          conditions: [{ status: 'True', type: 'Succeeded' }],
          id: 'vm-1',
          pipeline: [
            {
              completed: '2026-01-01T01:40:00Z',
              name: 'DiskTransfer',
              tasks: [buildPipelineTask('DiskTransfer', '2026-01-01T00:00:00Z', undefined, 0, 100)],
            },
          ],
        },
      ]),
      PERFORMANCE_META,
    );

    expect(result.transferSeconds).toBe(6000);
    expect(result.avgTransferRate).toBeUndefined();
  });
});
