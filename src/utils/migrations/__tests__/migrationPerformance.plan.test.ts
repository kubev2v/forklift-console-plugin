import type { V1beta1Plan } from '@forklift-ui/types';

import { getPlanMigrationPerformance } from '../migrationPerformance';

import { buildPipelineTask, MIB } from './migrationPerformance.fixtures';

describe('getPlanMigrationPerformance', () => {
  it('derives performance from the plan status mirror', () => {
    const plan = {
      metadata: { name: 'plan', namespace: 'ns', uid: 'plan-uid' },
      status: {
        migration: {
          completed: '2026-01-01T00:30:00Z',
          started: '2026-01-01T00:00:00Z',
          vms: [
            {
              id: 'a',
              pipeline: [
                {
                  name: 'DiskTransfer',
                  tasks: [
                    buildPipelineTask(
                      'DiskTransfer',
                      '2026-01-01T00:05:00Z',
                      '2026-01-01T00:25:00Z',
                      200,
                      200,
                    ),
                  ],
                },
              ],
            },
          ],
        },
      },
    } as unknown as V1beta1Plan;

    const result = getPlanMigrationPerformance(plan);

    expect(result?.planName).toBe('plan');
    expect(result?.copiedBytes).toBe(200 * MIB);
    expect(result?.transferSeconds).toBe(1200);
    expect(result?.avgTransferRate).toBeCloseTo((200 * MIB) / 1200);
  });

  it('returns undefined for a plan that never ran', () => {
    const plan = { metadata: { name: 'plan', namespace: 'ns' }, status: {} } as V1beta1Plan;

    expect(getPlanMigrationPerformance(plan)).toBeUndefined();
  });

  it('returns undefined when the plan is not loaded yet', () => {
    expect(getPlanMigrationPerformance(undefined)).toBeUndefined();
  });
});
