import type { Page } from '@playwright/test';

export const disableGuidedTour = async (page: Page) => {
  await page.addInitScript(() => {
    const existingSettings = window.localStorage.getItem('console-user-settings');
    const settings = existingSettings ? JSON.parse(existingSettings) : {};

    window.localStorage.setItem(
      'console-user-settings',
      JSON.stringify({ ...settings, 'console.guidedTour': { admin: { completed: true } } }),
    );
  });
};

export const waitForLoader = async (page: Page) => {
  const loader = page.locator('[data-test="loading-indicator"]');
  await loader.waitFor({ state: 'visible', timeout: 1000 });
  await loader.waitFor({ state: 'hidden', timeout: 30000 });
};
