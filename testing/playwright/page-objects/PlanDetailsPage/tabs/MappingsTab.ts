import { expect, type Locator, type Page } from '@playwright/test';

import { NetworkMapEditModal } from '../modals/NetworkMapEditModal';
import { StorageMapEditModal } from '../modals/StorageMapEditModal';

export class MappingsTab {
  readonly cancelButton: Locator;
  readonly mappingsHeading: Locator;
  readonly mappingsSection: Locator;
  readonly mappingsTab: Locator;
  readonly networkMapEditButton: Locator;
  readonly networkMapEditModal: NetworkMapEditModal;
  readonly networkMapNameItem: Locator;
  readonly networkMapReviewTable: Locator;
  protected readonly page: Page;
  readonly storageMapEditButton: Locator;
  readonly storageMapEditModal: StorageMapEditModal;
  readonly storageMapNameItem: Locator;
  readonly storageMapReviewTable: Locator;
  readonly updateMappingsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators using data-testid
    this.cancelButton = this.page.getByTestId('cancel-mappings-button');
    this.mappingsHeading = this.page.getByTestId('mappings-section-heading');
    this.mappingsSection = this.page.getByTestId('plan-mappings-section');
    this.mappingsTab = this.page.getByTestId('plan-details-tab-mappings');
    this.networkMapEditButton = this.page.getByTestId('network-map-edit-button');
    this.networkMapNameItem = this.page.getByTestId('network-map-name-item');
    this.networkMapReviewTable = this.page.getByTestId('network-map-review-table');
    this.storageMapEditButton = this.page.getByTestId('storage-map-edit-button');
    this.storageMapNameItem = this.page.getByTestId('storage-map-name-item');
    this.storageMapReviewTable = this.page.getByTestId('storage-map-review-table');
    this.updateMappingsButton = this.page.getByTestId('update-mappings-button');

    // Modal instances
    this.networkMapEditModal = new NetworkMapEditModal(page);
    this.storageMapEditModal = new StorageMapEditModal(page);
  }

  private getNetworkMappingRow(index: number): Locator {
    return this.page.getByTestId(`network-mapping-row-${index}`);
  }

  private getStorageMappingRow(index: number): Locator {
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
    await this.cancelButton.click();

    await expect(this.networkMapEditButton).toBeVisible();
    await expect(this.updateMappingsButton).not.toBeVisible();
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

  async getNetworkMapName(): Promise<string> {
    return (await this.networkMapNameItem.getByRole('link').textContent()) ?? '';
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  getNetworkMappingCount(): Promise<number> {
    return this.page.locator('[data-testid^="network-mapping-row-"]').count();
  }

  async getNetworkMappingCountFromReviewTable(): Promise<number> {
    return await this.networkMapReviewTable.locator('tbody tr').count();
  }

  async getStorageMapName(): Promise<string> {
    return (await this.storageMapNameItem.getByRole('link').textContent()) ?? '';
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  getStorageMappingCount(): Promise<number> {
    return this.page.locator('[data-testid^="storage-mapping-row-"]').count();
  }

  async getStorageMappingCountFromReviewTable(): Promise<number> {
    return await this.storageMapReviewTable.locator('tbody tr').count();
  }

  async navigateToMappingsTab(): Promise<void> {
    // Wait for tab to be visible (use or() for fallback to role selector if testid not present)
    const tabLocator = this.mappingsTab.or(this.page.getByRole('tab', { name: 'Mappings' }));
    await tabLocator.waitFor({ state: 'visible' });

    // Check if already selected
    const isSelected = await tabLocator.getAttribute('aria-selected');
    if (isSelected !== 'true') {
      await tabLocator.click();
    }

    await expect(tabLocator).toHaveAttribute('aria-selected', 'true');
  }

  async openNetworkMapEditModal(): Promise<NetworkMapEditModal> {
    await this.networkMapEditButton.click();
    await this.networkMapEditModal.waitForModalToOpen();
    return this.networkMapEditModal;
  }

  async openStorageMapEditModal(): Promise<StorageMapEditModal> {
    await this.storageMapEditButton.click();
    await this.storageMapEditModal.waitForModalToOpen();
    return this.storageMapEditModal;
  }

  async startEditingNetworkMap(): Promise<void> {
    await this.networkMapEditButton.click();

    await expect(this.updateMappingsButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(
      this.page.getByText('Click the update mappings button to save your changes'),
    ).toBeVisible();
  }

  async startEditingStorageMap(): Promise<void> {
    await this.storageMapEditButton.click();

    await expect(this.updateMappingsButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(
      this.page.getByText('Click the update mappings button to save your changes'),
    ).toBeVisible();
  }

  async updateMappings(): Promise<void> {
    await this.updateMappingsButton.click();

    await expect(this.networkMapEditButton).toBeVisible();
    await expect(this.updateMappingsButton).not.toBeVisible();
  }

  async verifyMappingsTab(): Promise<void> {
    await expect(this.mappingsHeading).toBeVisible();
    await expect(this.networkMapEditButton).toBeVisible();
    await expect(this.storageMapEditButton).toBeVisible();
    await expect(this.mappingsSection).toBeVisible();
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
    const buttons = row.locator('button.pf-v6-c-menu-toggle');

    await expect(buttons.nth(0)).toContainText(expectedSource);
    await expect(buttons.nth(1)).toContainText(expectedTarget);
  }

  async verifyNetworkMappingInReviewTable(
    index: number,
    expectedSource: string,
    expectedTarget: string,
  ): Promise<void> {
    const row = this.networkMapReviewTable.locator('tbody tr').nth(index);
    await expect(row.locator('td').first()).toContainText(expectedSource);
    await expect(row.locator('td').nth(1)).toContainText(expectedTarget);
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
    const buttons = row.locator('button.pf-v6-c-menu-toggle');

    await expect(buttons.nth(0)).toContainText(expectedSource);
    await expect(buttons.nth(1)).toContainText(expectedTarget);
  }

  async verifyStorageMappingInReviewTable(
    index: number,
    expectedSource: string,
    expectedTarget: string,
  ): Promise<void> {
    const row = this.storageMapReviewTable.locator('tbody tr').nth(index);
    await expect(row.locator('td').first()).toContainText(expectedSource);
    await expect(row.locator('td').nth(1)).toContainText(expectedTarget);
  }

  async verifyUpdateButtonEnabled(): Promise<void> {
    await expect(this.updateMappingsButton).toBeEnabled();
  }

  async waitForMappingsTabVisible(): Promise<void> {
    const tabLocator = this.mappingsTab.or(this.page.getByRole('tab', { name: 'Mappings' }));
    await tabLocator.waitFor({ state: 'visible' });
  }
}
