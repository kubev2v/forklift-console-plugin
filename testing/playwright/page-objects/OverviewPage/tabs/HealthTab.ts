import { expect, type Locator, type Page } from '@playwright/test';

// Pod watch data arrives asynchronously; give it time to settle before asserting.
const POD_WATCH_TIMEOUT_MS = 30_000;

export class HealthTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get conditionsCard(): Locator {
    return this.page.getByTestId('health-conditions-card');
  }

  get controllerCard(): Locator {
    return this.page.getByTestId('health-controller-card');
  }

  async navigateToHealthTab(): Promise<void> {
    await this.tab.click();
    await expect(this.controllerCard).toBeVisible();
  }

  get tab(): Locator {
    return this.page.getByRole('tab', { name: 'Health', exact: true });
  }

  async verifyCardsRender(): Promise<void> {
    await expect(this.controllerCard.getByRole('columnheader', { name: 'Pod' })).toBeVisible({
      timeout: POD_WATCH_TIMEOUT_MS,
    });
    await expect(this.controllerCard.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(this.conditionsCard).toBeVisible();
    await expect(this.conditionsCard.getByRole('columnheader', { name: 'Type' })).toBeVisible();
  }

  async verifyHealthTabSelected(): Promise<void> {
    await expect(this.tab).toHaveAttribute('aria-selected', 'true');
    await expect(this.page).toHaveURL(/\/health(?:\?|$)/);
  }
}
