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

let uniqueCounter = 0;

/**
 * Generates a unique ID without using Math.random() to avoid linting issues.
 * Uses timestamp and an incrementing counter for uniqueness.
 */
export const generateUniqueId = (): string => {
  uniqueCounter += 1;
  const timestamp = Date.now();
  const counter = uniqueCounter.toString(36).padStart(3, '0');
  return `${timestamp}-${counter}`;
};
