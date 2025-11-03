import type { Page } from '@playwright/test';

export const disableGuidedTour = async (page: Page) => {
  const skipButton = page.getByRole('button', { name: /skip tour/i });

  try {
    // Wait for button to appear, click it, then wait for modal to close
    await skipButton.waitFor({ state: 'visible', timeout: 5000 });
    await skipButton.click();
    await skipButton.waitFor({ state: 'hidden' });
  } catch {
    // Modal not showing
  }
};

export const isEmpty = (value: object | unknown[] | string | undefined | null): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};
