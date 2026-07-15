import { expect, type Locator, type Page } from '@playwright/test';

import {
  GUIDED_TOUR_CLICK_TIMEOUT_MS,
  GUIDED_TOUR_HIDDEN_TIMEOUT_MS,
  GUIDED_TOUR_MAX_ATTEMPTS,
  GUIDED_TOUR_RETRY_BACKOFF_MS,
  GUIDED_TOUR_VISIBLE_TIMEOUT_MS,
} from './timeouts';

/**
 * Dismisses the guided tour modal, retrying the click if the tour is still
 * mid-transition when it fires. The "Skip tour" button can report visible via
 * waitFor and still fail a forced click moments later — the tour re-renders
 * its position during its entrance animation, briefly detaching/reattaching
 * the button node. Retrying (rather than a longer single timeout) re-resolves
 * the locator against the settled DOM instead of racing the same transition.
 */
export const disableGuidedTour = async (page: Page): Promise<void> => {
  // Use .first() to avoid strict-mode crashes if two skip buttons are briefly in the DOM.
  const skipButton = page.getByRole('button', { name: /skip tour/i }).first();

  for (let attempt = 1; attempt <= GUIDED_TOUR_MAX_ATTEMPTS; attempt += 1) {
    try {
      await skipButton.waitFor({ state: 'visible', timeout: GUIDED_TOUR_VISIBLE_TIMEOUT_MS });
    } catch {
      // Tour not present on this build — nothing to dismiss.
      return;
    }

    try {
      await skipButton.click({ force: true, timeout: GUIDED_TOUR_CLICK_TIMEOUT_MS });
      await skipButton.waitFor({ state: 'hidden', timeout: GUIDED_TOUR_HIDDEN_TIMEOUT_MS });
      return;
    } catch (error) {
      if (attempt === GUIDED_TOUR_MAX_ATTEMPTS) {
        throw error;
      }
      await page.waitForTimeout(GUIDED_TOUR_RETRY_BACKOFF_MS);
    }
  }
};

// Dynamic plugin may not have registered its routes yet on first load; reload and retry once.
export const waitForVisibleWithReload = async (
  page: Page,
  locator: Locator,
  initialTimeoutMs: number,
  retryTimeoutMs: number,
): Promise<void> => {
  try {
    await expect(locator).toBeVisible({ timeout: initialTimeoutMs });
  } catch {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(locator).toBeVisible({ timeout: retryTimeoutMs });
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
