import { expect, type Page } from '@playwright/test';

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
    // Wait for the network map select element to be visible and enabled
    const selectElement = this.page.getByTestId('network-map-select');
    await expect(selectElement).toBeVisible();
    await expect(selectElement).toBeEnabled();

    // Wait for options to be available in the select
    await selectElement.click();
    await expect(this.page.getByRole('option').first()).toBeVisible();
    // Close the dropdown after checking
    await selectElement.click();
  }
}
