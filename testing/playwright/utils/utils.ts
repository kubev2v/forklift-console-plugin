import type { Page } from '@playwright/test';

export const disableGuidedTour = async (page: Page): Promise<void> => {
  // Use .first() to avoid strict-mode crashes if two skip buttons are briefly in the DOM.
  const skipButton = page.getByRole('button', { name: /skip tour/i }).first();

  try {
    // Short timeout: the tour either shows quickly or not at all.
    await skipButton.waitFor({ state: 'visible', timeout: 2000 });
    // force: true bypasses animation-stability checks that cause the default
    // actionTimeout (15 s) to be consumed when the button is mid-animation.
    await skipButton.click({ force: true, timeout: 3000 });
    await skipButton.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // Tour modal not present on this build — nothing to dismiss.
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
