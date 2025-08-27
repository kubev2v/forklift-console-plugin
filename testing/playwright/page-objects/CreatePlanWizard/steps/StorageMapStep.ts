import { expect, type Page } from '@playwright/test';

export class StorageMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectStorageMap(storageMap: { name: string; isPreExisting: boolean }): Promise<void> {
    const selectElement = this.page.getByTestId('storage-map-select');
    if (storageMap.isPreExisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: storageMap.name }).click();
    } else {
      await this.page.getByTestId('use-new-storage-map-radio').check();
      await this.page.getByRole('textbox').click();
      await this.page.getByRole('textbox').fill(storageMap.name);
    }
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-storage-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    // Wait for the storage map select element to be visible and enabled
    const selectElement = this.page.getByTestId('storage-map-select');
    await expect(selectElement).toBeVisible({ timeout: 10000 });
    await expect(selectElement).toBeEnabled({ timeout: 10000 });
  }
}
