import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';
import { disableGuidedTour } from '../utils/utils';

export class NetworkMapsListPage {
  private readonly navigationHelper: NavigationHelper;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navigationHelper = new NavigationHelper(page);
  }

  async clickCreateWithFormButton() {
    await this.page.getByRole('button', { name: 'Create network map' }).first().click();
    await this.page.getByTestId('create-network-map-form').click();
  }

  async clickCreateWithYamlButton() {
    await this.page.getByRole('button', { name: 'Create network map' }).first().click();
    await this.page.getByTestId('create-network-map-yaml').click();
    // Wait for YAML editor to load
    await expect(this.page.locator('.monaco-editor')).toBeVisible();
  }

  async navigate(namespace?: string): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: 'NetworkMap',
      namespace,
      allNamespaces: namespace === undefined,
    });
  }

  async navigateFromMainMenu() {
    await disableGuidedTour(this.page);
    await this.page.goto('/');

    await this.page.waitForLoadState('networkidle');
    await this.page.getByTestId('migration-nav-item').click();
    await this.page.getByTestId('network-mappings-nav-item').click();

    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~NetworkMap');
  }
}
