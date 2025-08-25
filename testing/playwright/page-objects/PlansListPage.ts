import { expect, type Page } from '@playwright/test';

import { disableGuidedTour, waitForLoader } from '../utils/utils';

export class PlansListPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async assertCreatePlanButtonEnabled() {
    await expect(this.createPlanButton).toBeVisible();
    await expect(this.createPlanButton).toBeEnabled();
    await expect(this.createPlanButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async clickCreatePlanButton() {
    await this.assertCreatePlanButtonEnabled();
    await this.createPlanButton.click();
  }

  get createPlanButton() {
    return this.page.getByTestId('create-plan-button');
  }

  async navigateFromMainMenu() {
    await disableGuidedTour(this.page);
    await this.page.goto('/');
    await waitForLoader(this.page);
    await this.page.getByTestId('migration-nav-item').click();
    await this.page.getByTestId('plans-nav-item').click();

    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan');
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('grid', { name: 'Migration plans' })).toBeVisible();
  }
}
