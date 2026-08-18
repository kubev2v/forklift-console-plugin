import { expect, type Locator, type Page } from '@playwright/test';

import { getMappingWizardFieldRows } from '../../../utils/mappingWizardFieldRows';
import { isEmpty } from '../../../utils/utils';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { waitForMappingSourceRows } from '../../../utils/waitForMappingSourceRows';

const EMPTY_NAD_OPTION_PREFIX = 'No network attachment definitions';
const NAD_OPTION_INVENTORY_TIMEOUT_MS = 60_000;

type TargetOption = {
  disabled: boolean;
  name: string;
};

export class NetworkMapStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async blurNetworkMapNameInput(): Promise<void> {
    const nameInput = this.page
      .getByTestId('create-plan-network-map-step')
      .getByRole('textbox')
      .last();
    if (await nameInput.isVisible()) {
      await nameInput.blur();
    }
  }

  private async fixDuplicateDefaultNetworkRows(): Promise<void> {
    const alertText = 'more than one interface mapped to Default Network';
    const hasAlert = await this.page
      .getByText(alertText, { exact: false })
      .isVisible({ timeout: 1_000 })
      .catch(() => false);

    if (!hasAlert) {
      return;
    }

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
    getRowText: (row: Locator) => Promise<string | null>;
    getTargetSelect: (row: Locator) => Locator;
    rows: Locator;
  } {
    if (isVersionAtLeast(V2_11_0)) {
      return {
        rows: getMappingWizardFieldRows(this.page),
        getRowText: (row: Locator) => row.textContent(),
        getTargetSelect: (row: Locator) => row.getByTestId('network-map-target-network-select'),
      };
    }

    const grid = this.page.getByRole('grid');
    const bodyRowGroup = grid.getByRole('rowgroup').nth(1);
    return {
      rows: bodyRowGroup.getByRole('row'),
      getRowText: (row: Locator) => row.getByRole('gridcell').first().textContent(),
      getTargetSelect: (row: Locator) => row.getByRole('gridcell').nth(1).getByRole('button'),
    };
  }

  private async listTargetOptions(): Promise<TargetOption[]> {
    const listbox = this.page.getByRole('listbox');
    const options = listbox.getByRole('option');
    const count = await options.count();
    const available: TargetOption[] = [];

    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      const name = ((await option.textContent()) ?? '').trim();
      const disabled = await option.isDisabled();
      available.push({ disabled, name });
    }

    return available;
  }

  private async mapRemainingDefaultRowsToIgnore(
    alreadyConfiguredSources: string[],
    usedTargets: Set<string>,
  ): Promise<void> {
    const { rows, getRowText, getTargetSelect } = this.getMappingRowLocators();
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const rowText = await getRowText(row);

      const alreadyConfigured = alreadyConfiguredSources.some((source) =>
        rowText?.includes(source),
      );
      if (!alreadyConfigured) {
        const targetSelect = getTargetSelect(row);
        const currentText = await targetSelect.textContent();
        const needsRemap =
          Boolean(currentText?.includes('Default network')) ||
          Boolean(currentText?.includes('Select target network'));

        if (needsRemap) {
          await this.blurNetworkMapNameInput();
          await expect(targetSelect).toBeEnabled();
          await targetSelect.click();
          await this.selectTargetNetworkOption('Ignore network', usedTargets);
        }
      }
    }
  }

  /**
   * Prefer the requested target; when multi-NIC rows hide Default/Ignore, fall
   * back to the next unused enabled NAD (`namespace/name`).
   */
  private async selectTargetNetworkOption(
    preferredName: string,
    usedTargets: Set<string>,
  ): Promise<void> {
    await this.waitForSelectableNetworkOptions();
    const available = await this.listTargetOptions();

    const preferred = available.find(
      (option) =>
        !option.disabled &&
        (option.name === preferredName || option.name.endsWith(`/${preferredName}`)),
    );
    if (preferred) {
      await this.page.getByRole('option', { name: preferred.name, exact: true }).click();
      usedTargets.add(preferred.name);
      return;
    }

    const fallback = available.find(
      (option) =>
        !option.disabled &&
        !option.name.startsWith(EMPTY_NAD_OPTION_PREFIX) &&
        option.name.includes('/') &&
        !usedTargets.has(option.name),
    );
    if (fallback) {
      await this.page.getByRole('option', { name: fallback.name, exact: true }).click();
      usedTargets.add(fallback.name);
      return;
    }

    const optionsList = available
      .map((option) => `  - ${option.name}${option.disabled ? ' (disabled)' : ''}`)
      .join('\n');
    throw new Error(
      `Could not select target network "${preferredName}". Available options:\n${optionsList}`,
    );
  }

  private async waitForAtLeastOneRow(): Promise<void> {
    const { rows } = this.getMappingRowLocators();
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  }

  private async waitForSelectableNetworkOptions(): Promise<void> {
    await this.waitForNetworkOptions();

    await expect
      .poll(
        async () => {
          const available = await this.listTargetOptions();
          return available.some(
            (option) => !option.disabled && !option.name.startsWith(EMPTY_NAD_OPTION_PREFIX),
          );
        },
        {
          timeout: NAD_OPTION_INVENTORY_TIMEOUT_MS,
          message:
            'Timed out waiting for selectable target networks (NADs). Multi-NIC rows hide Default/Ignore until NADs exist in the target namespace.',
        },
      )
      .toBe(true);
  }

  async configureMappings(
    mappings: { source: string; target: string }[],
    usedTargets: Set<string> = new Set<string>(),
  ): Promise<Set<string>> {
    for (const mapping of mappings) {
      await this.selectTargetNetworkForSource(mapping.source, mapping.target, usedTargets);
    }
    return usedTargets;
  }

  async fillAndComplete(networkMap: {
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
    name: string;
  }): Promise<void> {
    await this.verifyStepVisible();
    await this.waitForData();
    await this.selectNetworkMap(networkMap);
    await this.fixDuplicateDefaultNetworkRows();
  }

  async selectNetworkMap(networkMap: {
    isPreexisting: boolean;
    mappings?: { source: string; target: string }[];
    name: string;
  }): Promise<void> {
    const selectElement = this.page.getByTestId('network-map-select');
    if (networkMap.isPreexisting) {
      await selectElement.click();
      await this.page.getByRole('option', { name: networkMap.name }).click();
    } else {
      await this.page.getByTestId('use-new-network-map-radio').check();

      if (networkMap.name) {
        const nameInput = this.page
          .getByTestId('create-plan-network-map-step')
          .getByRole('textbox')
          .last();
        await nameInput.fill(networkMap.name);
        await nameInput.blur();
      }

      // Wait for auto-detected rows to load before configuring or mapping
      await this.waitForAtLeastOneRow();

      const usedTargets = new Set<string>();
      if (!isEmpty(networkMap.mappings)) {
        await this.configureMappings(networkMap.mappings, usedTargets);
      }

      // Map any rows still on "Default network" (or unselected) away from Default
      // to prevent the "more than one interface mapped to Default" wizard error.
      // Prefer Ignore; fall back to distinct NADs when multi-NIC hides Ignore.
      const configuredSources = networkMap.mappings?.map((mapping) => mapping.source) ?? [];
      await this.mapRemainingDefaultRowsToIgnore(configuredSources, usedTargets);
    }
  }

  async selectTargetNetworkForSource(
    sourceNetwork: string,
    targetNetwork: string,
    usedTargets: Set<string> = new Set<string>(),
  ): Promise<void> {
    const { rows, getRowText, getTargetSelect } = this.getMappingRowLocators();
    const availableNetworks = await waitForMappingSourceRows(rows, getRowText);
    const rowCount = await rows.count();

    let matchedRow = rows.first();
    let found = false;

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const text = await getRowText(row);
      if (text?.includes(sourceNetwork)) {
        matchedRow = row;
        found = true;
        break;
      }
    }

    if (!found) {
      // Wizard only lists networks used by the selected VMs. Lab VMs often have only
      // "VM Network" (no "Mgmt Network"). When a single source row is present, map that
      // row instead of requiring an exact fixture name match.
      if (availableNetworks.length === 1) {
        const [soleSource] = availableNetworks;
        for (let i = 0; i < rowCount; i += 1) {
          const row = rows.nth(i);
          if (((await getRowText(row)) ?? '').trim() === soleSource) {
            matchedRow = row;
            break;
          }
        }
      } else {
        const networksList = availableNetworks
          .map((network, i) => `  ${i + 1}. ${network}`)
          .join('\n');
        throw new Error(
          `Could not find row with source network: "${sourceNetwork}"\n` +
            `Available source networks (${availableNetworks.length}):\n${networksList}`,
        );
      }
    }

    const targetNetworkSelect = getTargetSelect(matchedRow);
    await expect(targetNetworkSelect).toBeVisible();
    await targetNetworkSelect.click();

    await this.selectTargetNetworkOption(targetNetwork, usedTargets);
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
