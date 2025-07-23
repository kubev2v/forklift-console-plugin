import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS } from '../../../fixtures/test-data';

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
    await this.page.waitForResponse(API_ENDPOINTS.storageMaps);
  }
}
