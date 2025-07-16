import { Page, expect } from '@playwright/test';
import { disableGuidedTour, waitForLoader } from '../utils/utils';

export class PlansListPage {
  constructor(private page: Page) {}


  async navigateFromMainMenu() {
    await disableGuidedTour(this.page);
    await this.page.goto('/');

    await waitForLoader(this.page);
    await this.page.getByTestId('migration-nav-item').click();
    await this.page.getByTestId('plans-nav-item').click();

    await expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan');
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('grid', { name: 'Migration plans' })).toBeVisible();
  }

  async clickCreatePlanButton() {
    await expect(this.page.getByTestId('create-plan-button')).toBeVisible();
    await expect(this.page.getByTestId('create-plan-button')).toBeEnabled();
    await this.page.getByTestId('create-plan-button').click();
  }
}