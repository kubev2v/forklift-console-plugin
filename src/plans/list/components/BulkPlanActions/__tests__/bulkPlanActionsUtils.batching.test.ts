import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { describe, expect, it } from '@jest/globals';

import { runSettledInBatches } from '../utils';

describe('BulkPlanActions utils - batching', () => {
  it('runs workers in bounded batches without await-in-loop', async () => {
    const activeCounts: number[] = [];
    let active = 0;

    const results = await runSettledInBatches(
      [1, 2, 3, 4, 5],
      async (value) => {
        active += 1;
        activeCounts.push(active);
        await Promise.resolve(value);
        active -= 1;
      },
      2,
    );

    expect(results).toHaveLength(5);
    expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
    expect(Math.max(...activeCounts)).toBeLessThanOrEqual(2);
  });

  it('collects rejected results from batched workers', async () => {
    const results = await runSettledInBatches(
      [1, 2, 3],
      (value) => {
        if (value === 2) {
          return Promise.reject(new Error('boom'));
        }
        return Promise.resolve();
      },
      2,
    );

    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled']);
  });
});
