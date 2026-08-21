import { expect, type Locator } from '@playwright/test';

const MAPPING_SOURCE_ROWS_TIMEOUT_MS = 15_000;
const MAPPING_SOURCE_ROWS_POLL_MS = 1_000;

/**
 * Wait until mapping source rows have loaded and the named-row count is stable.
 * A single named row can appear before remaining inventory rows mount; treating
 * that as complete retriggers the sole-source fallback.
 */
export const waitForMappingSourceRows = async (
  rows: Locator,
  getSourceText: (row: Locator) => Promise<string | null>,
): Promise<string[]> => {
  let available: string[] = [];
  let previousNamedCount = -1;

  await expect
    .poll(
      async () => {
        const count = await rows.count();
        if (count === 0) {
          previousNamedCount = -1;
          return 0;
        }

        available = [];
        for (let index = 0; index < count; index += 1) {
          const text = ((await getSourceText(rows.nth(index))) ?? '').trim();
          if (text) {
            available.push(text);
          }
        }

        if (available.length !== count) {
          previousNamedCount = -1;
          return 0;
        }

        if (previousNamedCount === count) {
          return count;
        }

        previousNamedCount = count;
        return 0;
      },
      {
        intervals: [MAPPING_SOURCE_ROWS_POLL_MS],
        message: 'Timed out waiting for mapping source rows to finish loading',
        timeout: MAPPING_SOURCE_ROWS_TIMEOUT_MS,
      },
    )
    .toBeGreaterThan(0);

  return available;
};
