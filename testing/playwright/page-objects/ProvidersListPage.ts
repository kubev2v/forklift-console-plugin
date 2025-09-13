import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';

export class ProvidersListPage {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
  }
  async assertCreateProviderButtonEnabled() {
    await expect(this.createProviderButton).toBeVisible({ timeout: 30000 });
    await expect(this.createProviderButton).toBeEnabled({ timeout: 30000 });
    await expect(this.createProviderButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async clickCreateProviderButton() {
    await this.page.waitForLoadState('networkidle');
    await this.assertCreateProviderButtonEnabled();
    await this.createProviderButton.click();
  }

  get createProviderButton() {
    return this.page.getByTestId('add-provider-button');
  }

  async navigateFromMainMenu() {
    await this.navigation.navigateToProviders();
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Provider');
  }

  async waitForPageLoad() {
    await expect(this.page.getByRole('grid', { name: 'Providers' })).toBeVisible();
  }
}
