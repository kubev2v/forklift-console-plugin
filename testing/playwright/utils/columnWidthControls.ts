import { expect, type Page } from '@playwright/test';

const RESET_LABEL = 'Reset column widths';
const FILTER_TOGGLE_LABEL = 'Show Filters';

export const columnWidthResetButton = (page: Page) =>
  page.getByRole('button', { exact: true, name: RESET_LABEL });

/** The Reset control can sit behind the responsive filter toggle at narrow widths. */
export const revealColumnWidthReset = async (page: Page): Promise<void> => {
  if (!(await columnWidthResetButton(page).isVisible())) {
    await page.getByRole('button', { exact: true, name: FILTER_TOGGLE_LABEL }).click();
  }
};

/**
 * Clears saved width overrides so the next scenario starts from the default layout.
 * A no-op when the table has no overrides, which is the case on a pristine page.
 */
export const resetColumnWidthsIfEnabled = async (page: Page): Promise<void> => {
  await revealColumnWidthReset(page);
  const reset = columnWidthResetButton(page);
  if (await reset.isEnabled()) {
    await reset.click();
  }
};

/**
 * Restores the default column set (visibility, order) and clears saved widths.
 * Collapsed specs share one page across viewport steps, so visibility changes from a
 * previous step must be undone explicitly before the next step starts.
 */
export const restoreDefaultColumns = async (page: Page): Promise<void> => {
  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  const modal = page.getByTestId('manage-columns-modal');
  await modal.getByRole('button', { name: 'Restore default columns' }).click();
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
};
