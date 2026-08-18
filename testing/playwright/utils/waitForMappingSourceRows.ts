import { expect, type Locator } from '@playwright/test';

const MAPPING_SOURCE_ROWS_TIMEOUT_MS = 15_000;

/**
 * Wait until every mapping row has a source name, then return those names.
 * Avoids treating a partially loaded table as a single-source lab.
 */
export const waitForMappingSourceRows = async (
  rows: Locator,
  getSourceText: (row: Locator) => Promise<string | null>,
): Promise<string[]> => {
  let available: string[] = [];

  await expect
    .poll(
      async () => {
        const count = await rows.count();
        if (count === 0) {
          return 0;
        }

        available = [];
        for (let index = 0; index < count; index += 1) {
          const text = ((await getSourceText(rows.nth(index))) ?? '').trim();
          if (text) {
            available.push(text);
          }
        }

        return available.length === count ? count : 0;
      },
      {
        message: 'Timed out waiting for every mapping row to show a source name',
        timeout: MAPPING_SOURCE_ROWS_TIMEOUT_MS,
      },
    )
    .toBeGreaterThan(0);

  return available;
};
