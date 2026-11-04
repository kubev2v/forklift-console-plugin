import { getMigrationPerformance } from '../migrationPerformance';

import { at, META, MIB, source, task } from './migrationPerformance.fixtures';

describe('getMigrationPerformance', () => {
  it('sums only disk transfer steps and converts MiB to bytes', () => {
    const result = getMigrationPerformance(
      source([
        {
          id: 'vm-1',
          pipeline: [
            {
              name: 'Initialize',
              tasks: [task('Initialize', '2026-01-01T00:00:00Z', '2026-01-01T00:01:00Z', 1, 1)],
            },
            {
              name: 'DiskAllocation',
              tasks: [
                task('DiskAllocation', '2026-01-01T00:01:00Z', '2026-01-01T00:02:00Z', 50, 50),
              ],
            },
            {
              name: 'DiskTransfer',
              tasks: [
                task('DiskTransfer', '2026-01-01T00:02:00Z', '2026-01-01T00:12:00Z', 100, 100),
              ],
            },
            {
              name: 'Cutover',
              tasks: [task('Cutover', '2026-01-01T00:12:00Z', '2026-01-01T00:22:00Z', 25, 25)],
            },
          ],
        },
      ]),
      META,
    );

    expect(result.copiedBytes).toBe(100 * MIB);
    expect(result.expectedBytes).toBe(100 * MIB);
    expect(result.transferSeconds).toBe(600);
    expect(result.avgTransferRate).toBeCloseTo((100 * MIB) / 600);
  });

  it('uses the widest disk-task window across VMs', () => {
    const result = getMigrationPerformance(
      source(
        [
          {
            id: 'a',
            pipeline: [
              {
                name: 'DiskTransferV2v',
                tasks: [
                  task('DiskTransferV2v', '2026-01-01T00:00:00Z', '2026-01-01T00:10:00Z', 10, 10),
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
                  task('DiskTransfer', '2026-01-01T00:05:00Z', '2026-01-01T00:30:00Z', 30, 30),
                ],
              },
            ],
          },
        ],
        '2026-01-01T00:00:00Z',
        '2026-01-01T01:00:00Z',
      ),
      META,
    );

    expect(result.transferSeconds).toBe(1800);
    expect(result.durationSeconds).toBe(3600);
    expect(result.vms).toHaveLength(2);
  });

  it('treats an open task with progress as running up to now', () => {
    const result = getMigrationPerformance(
      source(
        [
          {
            id: 'a',
            pipeline: [
              {
                name: 'DiskTransfer',
                tasks: [task('DiskTransfer', '2026-01-01T00:10:00Z', undefined, 50, 100)],
              },
            ],
            started: '2026-01-01T00:00:00Z',
          },
        ],
        '2026-01-01T00:00:00Z',
      ),
      META,
      at('2026-01-01T00:20:00Z'),
    );

    expect(result.durationSeconds).toBe(1200);
    expect(result.transferSeconds).toBe(600);
    expect(result.vms[0].transferRate).toBeCloseTo((50 * MIB) / 600);
    expect(result.status).toBe('Running');
  });
});
