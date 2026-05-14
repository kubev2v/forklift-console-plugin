import type { Locator, Page } from '@playwright/test';

/**
 * Rows in the create-plan network/storage mapping steps use `data-testid="field-row-{n}"`.
 * Match by attribute prefix so we do not rely on a RegExp in `getByTestId`.
 */
export const getMappingWizardFieldRows = (page: Page): Locator =>
  page.locator('[data-testid^="field-row-"]');
