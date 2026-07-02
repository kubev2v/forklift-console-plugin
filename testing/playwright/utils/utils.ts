import type { Page } from '@playwright/test';

// Short timeout: the tour either shows quickly or not at all.
const GUIDED_TOUR_VISIBLE_TIMEOUT_MS = 2000;
// force:true bypasses animation-stability checks that cause the default
// actionTimeout (15s) to be consumed when the button is mid-animation.
const GUIDED_TOUR_CLICK_TIMEOUT_MS = 3000;
const GUIDED_TOUR_HIDDEN_TIMEOUT_MS = 3000;

export const disableGuidedTour = async (page: Page): Promise<void> => {
  // Use .first() to avoid strict-mode crashes if two skip buttons are briefly in the DOM.
  const skipButton = page.getByRole('button', { name: /skip tour/i }).first();

  try {
    await skipButton.waitFor({ state: 'visible', timeout: GUIDED_TOUR_VISIBLE_TIMEOUT_MS });
    await skipButton.click({ force: true, timeout: GUIDED_TOUR_CLICK_TIMEOUT_MS });
    await skipButton.waitFor({ state: 'hidden', timeout: GUIDED_TOUR_HIDDEN_TIMEOUT_MS });
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
