import { expect, type Locator, type Page } from '@playwright/test';

import { getMappingWizardFieldRows } from '../../../utils/mappingWizardFieldRows';
import { isEmpty } from '../../../utils/utils';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';

export class NetworkMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async fixDuplicateDefaultNetworkRows(): Promise<void> {
    const alertText = 'more than one interface mapped to Default Network';
    const hasAlert = await this.page
      .getByText(alertText, { exact: false })
      .isVisible({ timeout: 1_000 })
      .catch(() => false);

    if (!hasAlert) return;

    const rows = getMappingWizardFieldRows(this.page);
    const count = await rows.count();

    for (let i = count - 1; i > 0; i -= 1) {
      const removeBtn = this.page.getByTestId(`remove-row-${i}`);
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await removeBtn.waitFor({ state: 'hidden' });
      }
    }
  }

  private getMappingRowLocators(): {
    rows: Locator;
    getRowText: (row: Locator) => Promise<string | null>;
    getTargetSelect: (row: Locator) => Locator;
  } {
    if (isVersionAtLeast(V2_11_0)) {
      return {
        rows: getMappingWizardFieldRows(this.page),
        getRowText: async (row: Locator) => await row.textContent(),
        getTargetSelect: (row: Locator) => row.getByTestId('network-map-target-network-select'),
      };
    }

    const grid = this.page.getByRole('grid');
    const bodyRowGroup = grid.getByRole('rowgroup').nth(1);
    return {
      rows: bodyRowGroup.getByRole('row'),
      getRowText: async (row: Locator) => await row.getByRole('gridcell').first().textContent(),
      getTargetSelect: (row: Locator) => row.getByRole('gridcell').nth(1).getByRole('button'),
    };
  }

  async configureMappings(mappings: { source: string; target: string }[]): Promise<void> {
    for (const mapping of mappings) {
      await this.selectTargetNetworkForSource(mapping.source, mapping.target);
    }
  }

  async fillAndComplete(networkMap: {
    name: string;
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
  }): Promise<void> {
    await this.verifyStepVisible();
    await this.waitForData();
    await this.selectNetworkMap(networkMap);
    await this.fixDuplicateDefaultNetworkRows();
  }

  async selectNetworkMap(networkMap: {
    name: string;
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
  }): Promise<void> {
    const selectElement = this.page.getByTestId('network-map-select');
    if (networkMap.isPreexisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: networkMap.name }).click();
    } else {
      await this.page.getByTestId('use-new-network-map-radio').check();

      if (networkMap.name) {
        await this.page.getByRole('textbox').click();
        await this.page.getByRole('textbox').fill(networkMap.name);
      }

      if (!isEmpty(networkMap.mappings)) {
        await this.configureMappings(networkMap.mappings!);
      }
    }
  }

  async selectTargetNetworkForSource(sourceNetwork: string, targetNetwork: string): Promise<void> {
    const { rows, getRowText, getTargetSelect } = this.getMappingRowLocators();
    const rowCount = await rows.count();

    let matchedRow = rows.first();
    let found = false;
    const availableNetworks: string[] = [];

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const text = await getRowText(row);
      if (text) {
        availableNetworks.push(text.trim());
      }
      if (text?.includes(sourceNetwork)) {
        matchedRow = row;
        found = true;
        break;
      }
    }

    if (!found) {
      const networksList = availableNetworks
        .map((network, i) => `  ${i + 1}. ${network}`)
        .join('\n');
      throw new Error(
        `Could not find row with source network: "${sourceNetwork}"\n` +
          `Available source networks (${availableNetworks.length}):\n${networksList}`,
      );
    }

    const targetNetworkSelect = getTargetSelect(matchedRow);
    await expect(targetNetworkSelect).toBeVisible();
    await targetNetworkSelect.click();

    await this.waitForNetworkOptions();
    await this.page.getByRole('option', { name: targetNetwork }).click();
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-network-map-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    const selectElement = this.page.getByTestId('network-map-select');
    await expect(selectElement).toBeVisible();
    await expect(selectElement).toBeEnabled();
  }

  async waitForNetworkOptions(): Promise<void> {
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();
  }
}
