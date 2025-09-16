import { expect, type Page } from '@playwright/test';

export class NetworkMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillAndComplete(networkMap: { name: string; isPreexisting: boolean }): Promise<void> {
    await this.verifyStepVisible();
    await this.waitForData();
    await this.selectNetworkMap(networkMap);
  }

  async selectNetworkMap(networkMap: { name: string; isPreexisting: boolean }): Promise<void> {
    const selectElement = this.page.getByTestId('network-map-select');
    if (networkMap.isPreexisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: networkMap.name }).click();
    } else {
      await this.page.getByTestId('use-new-network-map-radio').check();
      await this.page.getByRole('textbox').click();
      await this.page.getByRole('textbox').fill(networkMap.name);
    }
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-network-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    const selectElement = this.page.getByTestId('network-map-select');
    await expect(selectElement).toBeVisible({ timeout: 10000 });
    await expect(selectElement).toBeEnabled({ timeout: 10000 });
  }
}
