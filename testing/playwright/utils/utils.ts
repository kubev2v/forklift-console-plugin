import { expect, type Locator, type Page } from '@playwright/test';

// Short timeout: the tour either shows quickly or not at all.
const GUIDED_TOUR_VISIBLE_TIMEOUT_MS = 2000;
// force:true bypasses animation-stability checks; keep timeout short.
const GUIDED_TOUR_CLICK_TIMEOUT_MS = 3000;
const GUIDED_TOUR_HIDDEN_TIMEOUT_MS = 3000;

export const disableGuidedTour = async (page: Page): Promise<void> => {
  // Use .first() to avoid strict-mode crashes if two skip buttons are briefly in the DOM.
  const skipButton = page.getByRole('button', { name: /skip tour/i }).first();

  let isVisible = false;
  try {
    await skipButton.waitFor({ state: 'visible', timeout: GUIDED_TOUR_VISIBLE_TIMEOUT_MS });
    isVisible = true;
  } catch {
    // Tour not present on this build — nothing to dismiss.
  }

  if (isVisible) {
    await skipButton.click({ force: true, timeout: GUIDED_TOUR_CLICK_TIMEOUT_MS });
    await skipButton.waitFor({ state: 'hidden', timeout: GUIDED_TOUR_HIDDEN_TIMEOUT_MS });
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
