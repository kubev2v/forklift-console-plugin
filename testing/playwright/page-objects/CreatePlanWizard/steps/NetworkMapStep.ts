import { expect, type Page } from '@playwright/test';

import type { NetworkMap } from '../../../types/test-data';

export class NetworkMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectNetworkMap(networkMap: NetworkMap): Promise<void> {
    const mapName = networkMap.metadata?.name;
    if (!mapName) throw new Error('Network map name not provided in test data');

    const selectElement = this.page.getByTestId('network-map-select');
    if (networkMap.isPreExisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: mapName }).click();
    } else {
      await this.page.getByTestId('use-new-network-map-radio').check();
      await this.page.getByRole('textbox').click();
      await this.page.getByRole('textbox').fill(mapName);
    }
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-network-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    // Wait for the network map select element to be visible and enabled
    const selectElement = this.page.getByTestId('network-map-select');
    await expect(selectElement).toBeVisible({ timeout: 10000 });
    await expect(selectElement).toBeEnabled({ timeout: 10000 });
  }
}
