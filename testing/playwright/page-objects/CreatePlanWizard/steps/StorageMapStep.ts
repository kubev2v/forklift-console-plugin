import { expect, type Page } from '@playwright/test';

import { isEmpty } from '../../../utils/utils';

export class StorageMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async configureMappings(mappings: { source: string; target: string }[]): Promise<void> {
    for (const mapping of mappings) {
      await this.selectTargetStorageForSource(mapping.source, mapping.target);
    }
  }

  async fillAndComplete(storageMap: {
    name: string;
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
  }): Promise<void> {
    await this.verifyStepVisible();
    await this.waitForData();
    await this.selectStorageMap(storageMap);
  }

  async selectStorageMap(storageMap: {
    name: string;
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
  }): Promise<void> {
    const selectElement = this.page.getByTestId('storage-map-select');
    if (storageMap.isPreexisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: storageMap.name }).click();
    } else {
      await this.page.getByTestId('use-new-storage-map-radio').check();
      await this.page.getByRole('textbox').click();
      await this.page.getByRole('textbox').fill(storageMap.name);

      if (!isEmpty(storageMap.mappings)) {
        await this.configureMappings(storageMap.mappings!);
      }
    }
  }

  async selectTargetStorage(storageClassName: string): Promise<void> {
    const targetStorageSelect = this.page.getByTestId('target-storage-select');
    await expect(targetStorageSelect).toBeVisible();
    await targetStorageSelect.click();

    await this.waitForStorageOptions();
    await this.page.getByRole('option', { name: storageClassName }).click();
  }

  /**
   * Select a target storage for a given source storage in the storage mapping table.
   * Uses data-testid selectors for reliability.
   *
   * @param sourceStorage - Name of the source storage to find the row
   * @param targetStorage - Name of the target storage to select
   */
  async selectTargetStorageForSource(sourceStorage: string, targetStorage: string): Promise<void> {
    // Find all mapping rows and locate the one with the source storage
    const rows = this.page.getByTestId(/^field-row-\d+$/);
    const rowCount = await rows.count();

    let targetRow = null;
    const availableStorages: string[] = [];

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const text = await row.textContent();
      if (text) {
        availableStorages.push(text.trim());
      }
      if (text?.includes(sourceStorage)) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      throw new Error(
        `Could not find row with source storage: "${sourceStorage}"\n` +
          `Available source storages (${availableStorages.length}):\n${availableStorages.map((storage, i) => `  ${i + 1}. ${storage}`).join('\n')}`,
      );
    }

    // Find the target storage select using testId
    const targetStorageSelect = targetRow.getByTestId('target-storage-select');
    await expect(targetStorageSelect).toBeVisible();
    await targetStorageSelect.click();

    // Wait for options to appear and select the target storage
    await this.waitForStorageOptions();
    await this.page.getByRole('option', { name: targetStorage }).click();
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-storage-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    const selectElement = this.page.getByTestId('storage-map-select');
    await expect(selectElement).toBeVisible();
    await expect(selectElement).toBeEnabled();
  }

  /**
   * Wait for storage options to appear in the dropdown.
   * Checks that the listbox is visible rather than using .first() which can be brittle.
   */
  async waitForStorageOptions(): Promise<void> {
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();
  }
}
