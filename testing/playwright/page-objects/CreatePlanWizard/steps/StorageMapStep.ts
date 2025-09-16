import { expect, type Page } from '@playwright/test';

export class StorageMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillAndComplete(storageMap: {
    name: string;
    isPreexisting: boolean;
    targetStorage?: string;
  }): Promise<void> {
    await this.verifyStepVisible();
    await this.waitForData();
    await this.selectStorageMap(storageMap);
  }

  async selectStorageMap(storageMap: {
    name: string;
    isPreexisting: boolean;
    targetStorage?: string;
  }): Promise<void> {
    const selectElement = this.page.getByTestId('storage-map-select');
    if (storageMap.isPreexisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: storageMap.name }).click();
    } else {
      await this.page.getByTestId('use-new-storage-map-radio').check();
      await this.page.getByRole('textbox').click();
      await this.page.getByRole('textbox').fill(storageMap.name);

      if (storageMap.targetStorage) {
        await this.selectTargetStorage(storageMap.targetStorage);
      }
    }
  }

  async selectTargetStorage(storageClassName: string): Promise<void> {
    const targetStorageSelect = this.page.getByTestId('target-storage-select');
    await expect(targetStorageSelect).toBeVisible({ timeout: 10000 });
    await targetStorageSelect.click();

    await this.waitForStorageOptions();
    await this.page.getByRole('option', { name: storageClassName }).click();
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-storage-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    const selectElement = this.page.getByTestId('storage-map-select');
    await expect(selectElement).toBeVisible({ timeout: 10000 });
    await expect(selectElement).toBeEnabled({ timeout: 10000 });
  }

  async waitForStorageOptions(): Promise<void> {
    await expect(this.page.getByRole('option').first()).toBeVisible({ timeout: 10000 });
  }
}
