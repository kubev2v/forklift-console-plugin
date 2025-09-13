import { expect, type Page } from '@playwright/test';

/* eslint-disable @typescript-eslint/member-ordering */
export class MappingsTab {
  private readonly cancelButton = () => this.page.getByTestId('cancel-mappings-button');
  private readonly editMappingsButton = () => this.page.getByTestId('edit-mappings-button');
  private readonly mappingsTab = () => this.page.getByRole('tab', { name: 'Mappings' });
  private readonly networkMapSection = () => this.page.getByTestId('network-mappings-section');
  private readonly storageMapSection = () => this.page.getByTestId('storage-mappings-section');
  private readonly updateMappingsButton = () => this.page.getByTestId('update-mappings-button');

  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getNetworkMappingRow(index: number) {
    return this.page.getByTestId(`network-mapping-row-${index}`);
  }

  private getStorageMappingRow(index: number) {
    return this.page.getByTestId(`storage-mapping-row-${index}`);
  }

  async addNetworkMapping(): Promise<void> {
    const addButton = this.page.getByTestId('add-network-mapping-button');
    const currentCount = await this.getNetworkMappingCount();

    await addButton.click();

    await expect(this.page.locator('[data-testid^="network-mapping-row-"]')).toHaveCount(
      currentCount + 1,
    );
  }

  async addStorageMapping(): Promise<void> {
    const addButton = this.page.getByTestId('add-storage-mapping-button');
    const currentCount = await this.getStorageMappingCount();

    await addButton.click();

    await expect(this.page.locator('[data-testid^="storage-mapping-row-"]')).toHaveCount(
      currentCount + 1,
    );
  }

  async cancelEditingMappings(): Promise<void> {
    await this.cancelButton().click();

    await expect(this.editMappingsButton()).toBeVisible();
    await expect(this.updateMappingsButton()).not.toBeVisible();
  }

  async deleteNetworkMappingAtIndex(index: number): Promise<void> {
    const deleteButton = this.page.getByTestId(`delete-network-mapping-button-${index}`);
    const currentCount = await this.getNetworkMappingCount();

    await deleteButton.click();

    await expect(this.page.locator('[data-testid^="network-mapping-row-"]')).toHaveCount(
      currentCount - 1,
    );
  }

  async deleteStorageMappingAtIndex(index: number): Promise<void> {
    const deleteButton = this.page.getByTestId(`delete-storage-mapping-button-${index}`);
    const currentCount = await this.getStorageMappingCount();

    await deleteButton.click();

    await expect(this.page.locator('[data-testid^="storage-mapping-row-"]')).toHaveCount(
      currentCount - 1,
    );
  }

  async editNetworkMappingAtIndex(index: number, newTargetNetwork: string): Promise<void> {
    const row = this.getNetworkMappingRow(index);
    const targetButton = row.getByRole('button').nth(1);

    await targetButton.click();
    await this.page.getByRole('option', { name: newTargetNetwork, exact: true }).click();
    await expect(targetButton).toContainText(newTargetNetwork);
  }

  async editStorageMappingAtIndex(index: number, newTargetStorage: string): Promise<void> {
    const row = this.getStorageMappingRow(index);
    const targetButton = row.getByRole('button').nth(1);

    await targetButton.click();
    await this.page.getByRole('option', { name: newTargetStorage, exact: true }).click();
    await expect(targetButton).toContainText(newTargetStorage);
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  getNetworkMappingCount(): Promise<number> {
    return this.page.locator('[data-testid^="network-mapping-row-"]').count();
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  getStorageMappingCount(): Promise<number> {
    return this.page.locator('[data-testid^="storage-mapping-row-"]').count();
  }

  async navigateToMappingsTab(): Promise<void> {
    await this.mappingsTab().click();
    await expect(this.mappingsTab()).toHaveAttribute('aria-selected', 'true');
  }

  async startEditingMappings(): Promise<void> {
    await this.editMappingsButton().click();

    await expect(this.updateMappingsButton()).toBeVisible();
    await expect(this.cancelButton()).toBeVisible();
    await expect(
      this.page.getByText('Click the update mappings button to save your changes'),
    ).toBeVisible();
  }

  async updateMappings(): Promise<void> {
    await this.updateMappingsButton().click();

    await expect(this.editMappingsButton()).toBeVisible();
    await expect(this.updateMappingsButton()).not.toBeVisible();
  }

  async verifyMappingsTab(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Mappings' })).toBeVisible();
    await expect(this.editMappingsButton()).toBeVisible();
    await expect(this.storageMapSection()).toBeVisible();
    await expect(this.networkMapSection()).toBeVisible();
  }

  async verifyNetworkMappingAtIndex(
    index: number,
    expectedSource: string,
    expectedTarget: string,
  ): Promise<void> {
    const count = await this.getNetworkMappingCount();
    if (index >= count) {
      throw new Error(`Network mapping at index ${index} does not exist. Total mappings: ${count}`);
    }

    const row = this.page.getByTestId(`network-mapping-row-${index}`);
    const buttons = row.locator('button.pf-v5-c-menu-toggle');

    await expect(buttons.nth(0)).toContainText(expectedSource);
    await expect(buttons.nth(1)).toContainText(expectedTarget);
  }

  async verifyPlanStatus(expectedStatus: string): Promise<void> {
    await expect(this.page.locator('.forklift-page-headings__status')).toContainText(
      expectedStatus,
      { timeout: 30000 },
    );
  }

  async verifyStorageMappingAtIndex(
    index: number,
    expectedSource: string,
    expectedTarget: string,
  ): Promise<void> {
    const count = await this.getStorageMappingCount();
    if (index >= count) {
      throw new Error(`Storage mapping at index ${index} does not exist. Total mappings: ${count}`);
    }

    const row = this.page.getByTestId(`storage-mapping-row-${index}`);
    const buttons = row.locator('button.pf-v5-c-menu-toggle');

    await expect(buttons.nth(0)).toContainText(expectedSource);
    await expect(buttons.nth(1)).toContainText(expectedTarget);
  }

  async verifyUpdateButtonEnabled(): Promise<void> {
    await expect(this.updateMappingsButton()).toBeEnabled();
  }
}
