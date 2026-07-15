import { expect, type Locator, type Page } from '@playwright/test';

import {
  GUIDED_TOUR_CLICK_TIMEOUT_MS,
  GUIDED_TOUR_HIDDEN_TIMEOUT_MS,
  GUIDED_TOUR_VISIBLE_TIMEOUT_MS,
} from './timeouts';

/**
 * Dismisses the guided tour modal.
 *
 * The console persists tour completion per-user server-side (the
 * `console.guidedTour` key in the user-settings ConfigMap). Once a prior test
 * run has dismissed the tour, that flag is `completed: true`, so on every
 * subsequent load the console optimistically mounts the tour modal before
 * its settings fetch resolves, then immediately unmounts it once it reads
 * `completed: true` back. Our own `waitFor('visible')` can catch that
 * optimistic render right before the unmount, so the click that follows can
 * fire into an element that's already being torn down — a deterministic
 * race once the flag is set, not occasional flakiness.
 *
 * The click itself is just a means to an end: what actually matters is that
 * the tour is gone before tests proceed. So a click failure isn't treated as
 * fatal on its own — we still assert the tour ends up hidden (whether we
 * dismissed it or the console's own settings sync did), and only fail if it
 * doesn't.
 */
export const disableGuidedTour = async (page: Page): Promise<void> => {
  // Use .first() to avoid strict-mode crashes if two skip buttons are briefly in the DOM.
  const skipButton = page.getByRole('button', { name: /skip tour/i }).first();

  try {
    await skipButton.waitFor({ state: 'visible', timeout: GUIDED_TOUR_VISIBLE_TIMEOUT_MS });
  } catch {
    // Tour not present on this build — nothing to dismiss.
    return;
  }

  try {
    await skipButton.click({ force: true, timeout: GUIDED_TOUR_CLICK_TIMEOUT_MS });
  } catch {
    // Click may race the console's own dismissal once the tour is already
    // marked completed server-side; fall through to the hidden-state check,
    // which is the real success criterion.
  }
  await skipButton.waitFor({ state: 'hidden', timeout: GUIDED_TOUR_HIDDEN_TIMEOUT_MS });
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
