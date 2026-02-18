import { expect, type Locator, type Page } from '@playwright/test';

import { isEmpty } from '../../../utils/utils';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { OffloadOptions } from '../../common/OffloadOptions';

export class StorageMapStep {
  private readonly page: Page;
  readonly offload: OffloadOptions;

  constructor(page: Page) {
    this.page = page;
    this.offload = new OffloadOptions(page);
  }

  /**
   * Returns version-appropriate locators for mapping table rows.
   * 2.11+: uses data-testid="field-row-*" with td cells and target-storage-select.
   * <2.11: uses grid > rowgroup (body) > row with gridcell elements.
   */
  private getMappingRowLocators(): {
    rows: Locator;
    getSourceText: (row: Locator) => Promise<string | null>;
    getTargetSelect: (row: Locator) => Locator;
  } {
    if (isVersionAtLeast(V2_11_0)) {
      return {
        rows: this.page.getByTestId(/^field-row-\d+$/),
        getSourceText: (row: Locator) => row.locator('td').first().textContent(),
        getTargetSelect: (row: Locator) => row.getByTestId('target-storage-select'),
      };
    }

    const grid = this.page.getByRole('grid');
    const bodyRowGroup = grid.getByRole('rowgroup').nth(1);
    return {
      rows: bodyRowGroup.getByRole('row'),
      getSourceText: (row: Locator) => row.getByRole('gridcell').first().textContent(),
      getTargetSelect: (row: Locator) => row.getByRole('gridcell').nth(1).getByRole('button'),
    };
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
      await this.useNewStorageMapRadio.check();
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
   * Handles both 2.11+ (data-testid rows) and <2.11 (grid/gridcell rows).
   */
  async selectTargetStorageForSource(sourceStorage: string, targetStorage: string): Promise<void> {
    const { rows, getSourceText, getTargetSelect } = this.getMappingRowLocators();
    const rowCount = await rows.count();

    let matchedRow = rows.first();
    let found = false;
    const availableStorages: string[] = [];

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const text = await getSourceText(row);
      if (text) {
        availableStorages.push(text.trim());
      }
      if (text?.trim() === sourceStorage) {
        matchedRow = row;
        found = true;
        break;
      }
    }

    if (!found) {
      const storagesList = availableStorages
        .map((storage, i) => `  ${i + 1}. ${storage}`)
        .join('\n');
      throw new Error(
        `Could not find row with source storage: "${sourceStorage}"\n` +
          `Available source storages (${availableStorages.length}):\n${storagesList}`,
      );
    }

    const targetStorageSelect = getTargetSelect(matchedRow);
    await expect(targetStorageSelect).toBeVisible();
    await targetStorageSelect.click();

    await this.waitForStorageOptions();
    await this.page.getByRole('option', { name: targetStorage }).click();
  }

  get useNewStorageMapRadio(): Locator {
    return this.page.getByTestId('use-new-storage-map-radio');
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
   */
  async waitForStorageOptions(): Promise<void> {
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();
  }
}
