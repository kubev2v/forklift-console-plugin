import { getMigrationPerformance } from '../migrationPerformance';

import {
  buildMigrationSource,
  buildPipelineTask,
  MIB,
  PERFORMANCE_META,
  toTimestamp,
} from './migrationPerformance.fixtures';

describe('getMigrationPerformance', () => {
  it('sums only disk transfer steps and converts MiB to bytes', () => {
    const result = getMigrationPerformance(
      buildMigrationSource([
        {
          id: 'vm-1',
          pipeline: [
            {
              name: 'Initialize',
              tasks: [
                buildPipelineTask(
                  'Initialize',
                  '2026-01-01T00:00:00Z',
                  '2026-01-01T00:01:00Z',
                  1,
                  1,
                ),
              ],
            },
            {
              name: 'DiskAllocation',
              tasks: [
                buildPipelineTask(
                  'DiskAllocation',
                  '2026-01-01T00:01:00Z',
                  '2026-01-01T00:02:00Z',
                  50,
                  50,
                ),
              ],
            },
            {
              name: 'DiskTransfer',
              tasks: [
                buildPipelineTask(
                  'DiskTransfer',
                  '2026-01-01T00:02:00Z',
                  '2026-01-01T00:12:00Z',
                  100,
                  100,
                ),
              ],
            },
            {
              name: 'Cutover',
              tasks: [
                buildPipelineTask(
                  'Cutover',
                  '2026-01-01T00:12:00Z',
                  '2026-01-01T00:22:00Z',
                  25,
                  25,
                ),
              ],
            },
          ],
        },
      ]),
      PERFORMANCE_META,
    );

    expect(result.copiedBytes).toBe(100 * MIB);
    expect(result.expectedBytes).toBe(100 * MIB);
    expect(result.transferSeconds).toBe(600);
    expect(result.avgTransferRate).toBeCloseTo((100 * MIB) / 600);
  });

  it('uses the widest disk-task window across VMs', () => {
    const result = getMigrationPerformance(
      buildMigrationSource(
        [
          {
            id: 'a',
            pipeline: [
              {
                name: 'DiskTransferV2v',
                tasks: [
                  buildPipelineTask(
                    'DiskTransferV2v',
                    '2026-01-01T00:00:00Z',
                    '2026-01-01T00:10:00Z',
                    10,
                    10,
                  ),
                ],
              },
            ],
          },
          {
            id: 'b',
            pipeline: [
              {
                name: 'DiskTransfer',
                tasks: [
                  buildPipelineTask(
                    'DiskTransfer',
                    '2026-01-01T00:05:00Z',
                    '2026-01-01T00:30:00Z',
                    30,
                    30,
                  ),
                ],
              },
            ],
          },
        ],
        '2026-01-01T00:00:00Z',
        '2026-01-01T01:00:00Z',
      ),
      PERFORMANCE_META,
    );

    expect(result.transferSeconds).toBe(1800);
    expect(result.durationSeconds).toBe(3600);
    expect(result.vms).toHaveLength(2);
  });

  it('treats an open task with progress as running up to now', () => {
    const result = getMigrationPerformance(
      buildMigrationSource(
        [
          {
            id: 'a',
            pipeline: [
              {
                name: 'DiskTransfer',
                tasks: [
                  buildPipelineTask('DiskTransfer', '2026-01-01T00:10:00Z', undefined, 50, 100),
                ],
              },
            ],
            started: '2026-01-01T00:00:00Z',
          },
        ],
        '2026-01-01T00:00:00Z',
      ),
      PERFORMANCE_META,
      toTimestamp('2026-01-01T00:20:00Z'),
    );

    expect(result.durationSeconds).toBe(1200);
    expect(result.transferSeconds).toBe(600);
    expect(result.vms[0].transferRate).toBeCloseTo((50 * MIB) / 600);
    expect(result.status).toBe('Running');
  });
});
