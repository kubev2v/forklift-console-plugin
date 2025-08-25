import { expect, type Page } from '@playwright/test';

import { disableGuidedTour, waitForLoader } from '../utils/utils';

export class ProvidersListPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  async assertCreateProviderButtonEnabled() {
    await expect(this.createProviderButton).toBeVisible();
    await expect(this.createProviderButton).toBeEnabled();
    await expect(this.createProviderButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async clickCreateProviderButton() {
    await this.assertCreateProviderButtonEnabled();
    await this.createProviderButton.click();
  }

  get createProviderButton() {
    return this.page.getByTestId('add-provider-button');
  }

  async navigateFromMainMenu() {
    await disableGuidedTour(this.page);
    await this.page.goto('/');
    await waitForLoader(this.page);
    await this.page.getByTestId('migration-nav-item').click();
    await this.page.getByTestId('providers-nav-item').click();
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Provider');
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('grid', { name: 'Providers' })).toBeVisible();
  }
}
