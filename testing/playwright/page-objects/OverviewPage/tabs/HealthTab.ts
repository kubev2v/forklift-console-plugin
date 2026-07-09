import { expect, type Locator, type Page } from '@playwright/test';

import { POD_WATCH_TIMEOUT_MS } from '../../../utils/timeouts';
import { V5_0_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';

export class HealthTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get conditionsCard(): Locator {
    return isVersionAtLeast(V5_0_0)
      ? this.page.getByTestId('health-conditions-card')
      : // nth(1) targets the second Expandable table — conditions follow controller (nth(0)).
        this.page.getByRole('grid', { name: 'Expandable table' }).nth(1);
  }

  get controllerCard(): Locator {
    return isVersionAtLeast(V5_0_0)
      ? this.page.getByTestId('health-controller-card')
      : this.page.getByRole('grid', { name: 'Expandable table' }).first();
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
