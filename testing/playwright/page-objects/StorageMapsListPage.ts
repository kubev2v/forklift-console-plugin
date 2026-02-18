import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';

export class StorageMapsListPage {
  private readonly navigationHelper: NavigationHelper;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navigationHelper = new NavigationHelper(page);
  }

  async clickCreateWithFormButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create storage map' }).first().click();
    await this.page.getByText('Create with form').click();
    await this.page.waitForURL(/storageMaps\/create\/form/);
    await expect(this.page.getByRole('heading', { name: 'Create storage map' })).toBeVisible();
  }

  async navigate(namespace?: string): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: 'StorageMap',
      namespace,
      allNamespaces: namespace === undefined,
    });
  }
}
