import { expect, type Page } from '@playwright/test';

import { isEmpty } from '../../../utils/utils';

export class NetworkMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
      await this.page.getByRole('textbox').click();
      await this.page.getByRole('textbox').fill(networkMap.name);

      if (!isEmpty(networkMap.mappings)) {
        await this.configureMappings(networkMap.mappings!);
      }
    }
  }

  /**
   * Select a target network for a given source network in the network mapping table.
   * Uses data-testid selectors for reliability.
   *
   * @param sourceNetwork - Name of the source network to find the row
   * @param targetNetwork - Name of the target network to select
   */
  async selectTargetNetworkForSource(sourceNetwork: string, targetNetwork: string): Promise<void> {
    // Find all mapping rows and locate the one with the source network
    const rows = this.page.getByTestId(/^field-row-\d+$/);
    const rowCount = await rows.count();

    let targetRow = null;
    const availableNetworks: string[] = [];

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const text = await row.textContent();
      if (text) {
        availableNetworks.push(text.trim());
      }
      if (text?.includes(sourceNetwork)) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      throw new Error(
        `Could not find row with source network: "${sourceNetwork}"\n` +
          `Available source networks (${availableNetworks.length}):\n${availableNetworks.map((network, i) => `  ${i + 1}. ${network}`).join('\n')}`,
      );
    }

    // Find the target network select button using testId pattern
    const targetNetworkSelect = targetRow.getByTestId(/^target-network-/);
    await expect(targetNetworkSelect).toBeVisible();
    await targetNetworkSelect.click();

    // Wait for options to appear and select the target network
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

  /**
   * Wait for network options to appear in the dropdown.
   * Checks that the listbox is visible rather than using .first() which can be brittle.
   */
  async waitForNetworkOptions(): Promise<void> {
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();
  }
}
