import type { Page } from '@playwright/test';

/**
 * Disables the guided tour by setting localStorage to mark it as completed.
 * Call this before page.goto() to prevent the modal from appearing.
 */
export const disableGuidedTour = async (page: Page) => {
  await page.addInitScript(() => {
    const existingSettings = window.localStorage.getItem('console-user-settings');
    const settings = existingSettings ? JSON.parse(existingSettings) : {};

    // Add guided tour completion to the settings
    window.localStorage.setItem(
      'console-user-settings',
      JSON.stringify({ ...settings, 'console.guidedTour': { admin: { completed: true } } }),
    );
  });
};

/**
 * Skips the guided tour modal if it appears on the page.
 * Use disableGuidedTour() instead for better performance.
 * @deprecated Use disableGuidedTour() instead
 */
export const skipGuidedTourIfPresent = async (page: Page) => {
  const modal = page.locator('[data-test="guided-tour-modal"]');
  try {
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: 'Skip tour' }).click();
  } catch {
    // Guided tour modal did not appear
  }
};

/**
 * Waits for a loading indicator to appear and then disappear.
 * This is useful for waiting for page loads or async operations to complete.
 */
export const waitForLoader = async (page: Page) => {
  const loader = page.locator('[data-test="loading-indicator"]');
  await loader.waitFor({ state: 'visible', timeout: 1000 });
  await loader.waitFor({ state: 'hidden', timeout: 30000 });
};
