import { expect, type Page } from '@playwright/test';

import { disableGuidedTour } from '../utils/utils';

export class NetworkMapsListPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickCreateNetworkMapButton() {
    await this.page.getByRole('button', { name: 'Create network map' }).first().click();
    await this.page.getByTestId('create-network-map-form').click();
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
