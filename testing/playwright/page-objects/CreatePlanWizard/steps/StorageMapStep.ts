import { expect, type Page } from '@playwright/test';

export class StorageMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectStorageMap(storageMapName: string): Promise<void> {
    await this.page.getByTestId('storage-map-select').click();
    await this.page.getByRole('option', { name: storageMapName }).click();
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-storage-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    // Wait for the storage map select element to be visible and enabled
    const selectElement = this.page.getByTestId('storage-map-select');
    await expect(selectElement).toBeVisible();
    await expect(selectElement).toBeEnabled();

    // Wait for options to be available in the select
    await selectElement.click();
    await expect(this.page.getByRole('option').first()).toBeVisible({ timeout: 3000 });
    // Close the dropdown after checking
    await selectElement.click();
  }
}
