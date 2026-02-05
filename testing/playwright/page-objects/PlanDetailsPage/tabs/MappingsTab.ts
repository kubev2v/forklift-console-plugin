/* eslint-disable perfectionist/sort-classes, @typescript-eslint/member-ordering */
import { expect, type Page } from '@playwright/test';

import { NetworkMapEditModal } from '../modals/NetworkMapEditModal';
import { StorageMapEditModal } from '../modals/StorageMapEditModal';

export class MappingsTab {
  // Locators using data-testid
  private readonly cancelButton = () => this.page.getByTestId('cancel-mappings-button');
  private readonly mappingsHeading = () => this.page.getByTestId('mappings-section-heading');
  private readonly mappingsSection = () => this.page.getByTestId('plan-mappings-section');
  private readonly mappingsTab = () => this.page.getByTestId('plan-details-tab-mappings');
  private readonly mappingsTabFallback = () => this.page.getByRole('tab', { name: 'Mappings' });
  private readonly networkMapEditButton = () => this.page.getByTestId('network-map-edit-button');
  private readonly networkMapNameItem = () => this.page.getByTestId('network-map-name-item');
  private readonly networkMapReviewTable = () => this.page.getByTestId('network-map-review-table');
  private readonly storageMapEditButton = () => this.page.getByTestId('storage-map-edit-button');
  private readonly storageMapNameItem = () => this.page.getByTestId('storage-map-name-item');
  private readonly storageMapReviewTable = () => this.page.getByTestId('storage-map-review-table');
  private readonly updateMappingsButton = () => this.page.getByTestId('update-mappings-button');

  public readonly networkMapEditModal: NetworkMapEditModal;
  protected readonly page: Page;
  public readonly storageMapEditModal: StorageMapEditModal;

  constructor(page: Page) {
    this.page = page;
    this.networkMapEditModal = new NetworkMapEditModal(page);
    this.storageMapEditModal = new StorageMapEditModal(page);
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

    await expect(this.networkMapEditButton()).toBeVisible();
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

  async getNetworkMappingCountFromReviewTable(): Promise<number> {
    return await this.networkMapReviewTable().locator('tbody tr').count();
  }

  async getNetworkMapName(): Promise<string> {
    return (await this.networkMapNameItem().getByRole('link').textContent()) ?? '';
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  getStorageMappingCount(): Promise<number> {
    return this.page.locator('[data-testid^="storage-mapping-row-"]').count();
  }

  async getStorageMappingCountFromReviewTable(): Promise<number> {
    return await this.storageMapReviewTable().locator('tbody tr').count();
  }

  async getStorageMapName(): Promise<string> {
    return (await this.storageMapNameItem().getByRole('link').textContent()) ?? '';
  }

  async navigateToMappingsTab(): Promise<void> {
    // Try data-testid first, fallback to role selector
    const tab = this.mappingsTab();
    const tabFallback = this.mappingsTabFallback();

    // Wait for either tab to be visible
    await Promise.race([
      tab.waitFor({ state: 'visible' }),
      tabFallback.waitFor({ state: 'visible' }),
    ]);

    // Use whichever is visible
    const visibleTab = (await tab.isVisible()) ? tab : tabFallback;

    // Check if already selected
    const isSelected = await visibleTab.getAttribute('aria-selected');
    if (isSelected !== 'true') {
      await visibleTab.click();
    }

    await expect(visibleTab).toHaveAttribute('aria-selected', 'true');
  }

  async openNetworkMapEditModal(): Promise<NetworkMapEditModal> {
    await this.networkMapEditButton().click();
    await this.networkMapEditModal.waitForModalToOpen();
    return this.networkMapEditModal;
  }

  async openStorageMapEditModal(): Promise<StorageMapEditModal> {
    await this.storageMapEditButton().click();
    await this.storageMapEditModal.waitForModalToOpen();
    return this.storageMapEditModal;
  }

  async startEditingNetworkMap(): Promise<void> {
    await this.networkMapEditButton().click();

    await expect(this.updateMappingsButton()).toBeVisible();
    await expect(this.cancelButton()).toBeVisible();
    await expect(
      this.page.getByText('Click the update mappings button to save your changes'),
    ).toBeVisible();
  }

  async startEditingStorageMap(): Promise<void> {
    await this.storageMapEditButton().click();

    await expect(this.updateMappingsButton()).toBeVisible();
    await expect(this.cancelButton()).toBeVisible();
    await expect(
      this.page.getByText('Click the update mappings button to save your changes'),
    ).toBeVisible();
  }

  async updateMappings(): Promise<void> {
    await this.updateMappingsButton().click();

    await expect(this.networkMapEditButton()).toBeVisible();
    await expect(this.updateMappingsButton()).not.toBeVisible();
  }

  async verifyMappingsTab(): Promise<void> {
    await expect(this.mappingsHeading()).toBeVisible();
    await expect(this.networkMapEditButton()).toBeVisible();
    await expect(this.storageMapEditButton()).toBeVisible();
    await expect(this.mappingsSection()).toBeVisible();
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
    const row = this.networkMapReviewTable().locator('tbody tr').nth(index);
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
    const row = this.storageMapReviewTable().locator('tbody tr').nth(index);
    await expect(row.locator('td').first()).toContainText(expectedSource);
    await expect(row.locator('td').nth(1)).toContainText(expectedTarget);
  }

  async verifyUpdateButtonEnabled(): Promise<void> {
    await expect(this.updateMappingsButton()).toBeEnabled();
  }

  async waitForMappingsTabVisible(): Promise<void> {
    // Try data-testid first, fallback to role selector
    await Promise.race([
      this.mappingsTab().waitFor({ state: 'visible' }),
      this.mappingsTabFallback().waitFor({ state: 'visible' }),
    ]);
  }
}
