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

export const dismissGuidedTourModal = async (page: Page): Promise<void> => {
  const tourDialog = page.getByRole('dialog');

  if (await tourDialog.isVisible({ timeout: 10000 })) {
    const skipButton = tourDialog.getByRole('button', { name: 'Skip tour' });
    await skipButton.click();
    await tourDialog.waitFor({ state: 'hidden' });
  }
};

export const isEmpty = (value: object | unknown[] | string | undefined | null): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value) || typeof value === 'string') {
    // eslint-disable-next-line no-restricted-syntax
    return value.length === 0;
  }

  if (typeof value === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    return Object.keys(value).length === 0;
  }

  return false;
};
