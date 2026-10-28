import { expect, type Locator, type Page } from '@playwright/test';

import {
  GUIDED_TOUR_CLICK_TIMEOUT_MS,
  GUIDED_TOUR_HIDDEN_TIMEOUT_MS,
  GUIDED_TOUR_VISIBLE_TIMEOUT_MS,
} from './timeouts';

/**
 * Dismisses the guided tour modal.
 *
 * Once the tour has been dismissed before (completion is persisted per-user
 * server-side), the console briefly mounts the modal on every load before
 * unmounting it once its settings fetch resolves. `waitFor('visible')` can
 * catch that optimistic render right before teardown, so the click can race
 * an element that's already disappearing. The click is a means to an end,
 * not the success criterion — only the final `waitFor('hidden')` is.
 */
export const disableGuidedTour = async (page: Page): Promise<void> => {
  // Use .first() to avoid strict-mode crashes if two skip buttons are briefly in the DOM.
  const skipButton = page.getByRole('button', { name: /skip tour/iu }).first();

  try {
    await skipButton.waitFor({ state: 'visible', timeout: GUIDED_TOUR_VISIBLE_TIMEOUT_MS });
  } catch {
    // Tour not present on this build — nothing to dismiss.
    return;
  }

  try {
    await skipButton.click({ force: true, timeout: GUIDED_TOUR_CLICK_TIMEOUT_MS });
  } catch {
    // May race the console's own dismissal; the hidden-state check below is
    // the real success criterion, so a click failure alone isn't fatal.
  }
  await skipButton.waitFor({ state: 'hidden', timeout: GUIDED_TOUR_HIDDEN_TIMEOUT_MS });
};

/** Run common post-navigation cleanup before interacting with the console UI. */
export const prepareConsolePage = async (page: Page): Promise<void> => {
  await disableGuidedTour(page);
};

const CONSOLE_ERROR_BOUNDARY_HEADING = 'Something wrong happened';

/**
 * Throws when OpenShift's error boundary replaced the page (plugin runtime error).
 * Common with a broken local `npm start` bundle; CI production builds do not hit this.
 */
export const assertNoConsoleErrorBoundary = async (page: Page): Promise<void> => {
  const errorBoundary = page.getByRole('heading', { name: CONSOLE_ERROR_BOUNDARY_HEADING });
  if (await errorBoundary.isVisible().catch(() => false)) {
    const detail = (await page.locator('main').textContent()) ?? '';
    throw new Error(
      `Console error boundary is visible (${CONSOLE_ERROR_BOUNDARY_HEADING}). ` +
        'Fix the plugin build/runtime error before running E2E (check npm start / npm run build, ' +
        'or use npm run console). ' +
        `Page excerpt: ${detail.slice(0, 300)}`,
    );
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
