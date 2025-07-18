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
    await this.page.waitForResponse(
      '**/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps?limit=250',
    );
  }
}
