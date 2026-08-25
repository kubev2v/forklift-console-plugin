import { expect, type Locator, type Page } from '@playwright/test';

import { getMappingWizardFieldRows } from '../../../utils/mappingWizardFieldRows';
import { isEmpty } from '../../../utils/utils';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { waitForMappingSourceRows } from '../../../utils/waitForMappingSourceRows';
import { AccessModeOptions } from '../../common/AccessModeOptions';
import { OffloadOptions } from '../../common/OffloadOptions';

export class StorageMapStep {
  private readonly page: Page;
  readonly accessMode: AccessModeOptions;
  readonly offload: OffloadOptions;

  constructor(page: Page) {
    this.page = page;
    this.accessMode = new AccessModeOptions(page);
    this.offload = new OffloadOptions(page);
  }

  /**
   * Returns version-appropriate locators for mapping table rows.
   * 2.11+: uses data-testid="field-row-{n}" (see `getMappingWizardFieldRows`) with td cells and target-storage-select.
   * <2.11: uses grid > rowgroup (body) > row with gridcell elements.
   */
  private getMappingRowLocators(): {
    getSourceText: (row: Locator) => Promise<string | null>;
    getTargetSelect: (row: Locator) => Locator;
    rows: Locator;
  } {
    if (isVersionAtLeast(V2_11_0)) {
      return {
        getSourceText: (row: Locator) => row.locator('td').first().textContent(),
        getTargetSelect: (row: Locator) => row.getByTestId('target-storage-select'),
        rows: getMappingWizardFieldRows(this.page),
      };
    }

    const grid = this.page.getByRole('grid');
    const bodyRowGroup = grid.getByRole('rowgroup').nth(1);
    return {
      getSourceText: (row: Locator) => row.getByRole('gridcell').first().textContent(),
      getTargetSelect: (row: Locator) => row.getByRole('gridcell').nth(1).getByRole('button'),
      rows: bodyRowGroup.getByRole('row'),
    };
  }

  async configureMappings(mappings: { source: string; target: string }[]): Promise<void> {
    for (const mapping of mappings) {
      await this.selectTargetStorageForSource(mapping.source, mapping.target);
    }
  }

  async fillAndComplete(storageMap: {
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
    name: string;
  }): Promise<void> {
    await this.verifyStepVisible();
    await this.waitForData();
    await this.selectStorageMap(storageMap);
  }

  async selectStorageMap(storageMap: {
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
    name: string;
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
        await this.configureMappings(storageMap.mappings ?? []);
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
    const { getSourceText, getTargetSelect, rows } = this.getMappingRowLocators();
    const availableStorages = await waitForMappingSourceRows(rows, getSourceText);
    const rowCount = await rows.count();

    let matchedRow = rows.first();
    let found = false;

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const text = ((await getSourceText(row)) ?? '').trim();
      if (text === sourceStorage) {
        matchedRow = row;
        found = true;
        break;
      }
    }

    if (!found) {
      // Wizard only lists storages used by the selected VMs; lab NFS names differ by VM
      // (e.g. mtv-nfs-rhos-v8 vs mtv-nfs-psi-rdu2-v8). When a single source is present,
      // map that row instead of requiring an exact fixture name match.
      if (availableStorages.length === 1) {
        const [soleSource] = availableStorages;
        for (let i = 0; i < rowCount; i += 1) {
          const row = rows.nth(i);
          if (((await getSourceText(row)) ?? '').trim() === soleSource) {
            matchedRow = row;
            break;
          }
        }
      } else {
        const storagesList = availableStorages
          .map((storage, i) => `  ${i + 1}. ${storage}`)
          .join('\n');
        throw new Error(
          `Could not find row with source storage: "${sourceStorage}"\n` +
            `Available source storages (${availableStorages.length}):\n${storagesList}`,
        );
      }
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
