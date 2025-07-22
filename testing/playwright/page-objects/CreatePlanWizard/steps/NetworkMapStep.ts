import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS } from '../../../fixtures/test-data';

export class NetworkMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectNetworkMap(networkMapName: string): Promise<void> {
    await this.page.getByTestId('network-map-select').click();
    await this.page.getByRole('option', { name: networkMapName }).click();
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-network-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(API_ENDPOINTS.networkMaps);
  }
}
