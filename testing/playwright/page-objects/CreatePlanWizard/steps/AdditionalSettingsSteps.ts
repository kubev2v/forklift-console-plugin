import { expect, type Locator, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';
import { isEmpty } from '../../../utils/utils';

export class AdditionalSettingsStep {
  private readonly page: Page;
  readonly powerStateOptionAuto: Locator;
  readonly powerStateOptionOff: Locator;
  readonly powerStateOptionOn: Locator;
  readonly targetPowerStateSelect: Locator;
  readonly useNbdeClevisCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.targetPowerStateSelect = page.getByTestId('target-power-state-select');
    this.powerStateOptionAuto = page.getByTestId('power-state-option-auto');
    this.powerStateOptionOn = page.getByTestId('power-state-option-on');
    this.powerStateOptionOff = page.getByTestId('power-state-option-off');
    this.useNbdeClevisCheckbox = page.getByTestId('use-nbde-clevis-checkbox');
  }

  async fillAndComplete(
    additionalPlanSettings: PlanTestData['additionalPlanSettings'],
  ): Promise<void> {
    if (additionalPlanSettings?.targetPowerState) {
      await this.targetPowerStateSelect.click();
      await this.powerStateOption(additionalPlanSettings.targetPowerState).click();
    }
    if (additionalPlanSettings?.useNbdeClevis) {
      await this.useNbdeClevisCheckbox.check();
    }
    if (additionalPlanSettings?.instanceTypes && !isEmpty(additionalPlanSettings.instanceTypes)) {
      for (const [vmName, label] of Object.entries(additionalPlanSettings.instanceTypes)) {
        await this.selectInstanceTypeByLabel(vmName, label);
      }
    }
  }

  instanceTypeSelectToggle(vmName: string): Locator {
    return this.page
      .locator('.instance-type-field__vm-name', { hasText: vmName })
      .locator('..')
      .getByRole('button', { name: 'Select menu toggle' });
  }

  get instanceTypesSection(): Locator {
    return this.page.locator('[data-testid^="instance-type-select-"]').first();
  }

  powerStateOption(state: 'on' | 'off' | 'auto'): Locator {
    return this.page.getByTestId(`power-state-option-${state}`);
  }

  async selectInstanceTypeByLabel(vmName: string, optionLabel: string): Promise<void> {
    const toggle = this.instanceTypeSelectToggle(vmName);
    await expect(toggle).toBeEnabled({ timeout: 120_000 });
    await toggle.click();
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  async selectNoneInstanceType(vmName: string): Promise<void> {
    const toggle = this.instanceTypeSelectToggle(vmName);
    await expect(toggle).toBeEnabled({ timeout: 120_000 });
    await toggle.click();
    await this.page.getByRole('option', { name: /^None/ }).click();
  }

  /**
   * Picks the n-th cluster instance type option (0 = first non-None) and returns its label.
   */
  async selectNonNoneInstanceTypeByIndex(vmName: string, index: number): Promise<string> {
    const toggle = this.instanceTypeSelectToggle(vmName);
    await expect(toggle).toBeEnabled({ timeout: 120_000 });
    await toggle.click();
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const options = listbox.getByRole('option');
    let nonNoneOrdinal = 0;
    const count = await options.count();

    for (let i = 0; i < count; i += 1) {
      const opt = options.nth(i);
      const name = (await opt.innerText()).split('\n')[0]?.trim() ?? '';

      if (name !== 'None') {
        if (nonNoneOrdinal === index) {
          await opt.click();
          return name;
        }

        nonNoneOrdinal += 1;
      }
    }

    throw new Error(`No non-None instance type at index ${index} for VM "${vmName}"`);
  }

  async verifyInstanceTypeDropdownCount(expected: number): Promise<void> {
    await expect(this.page.locator('[data-testid^="instance-type-select-"]')).toHaveCount(expected);
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Other settings' })).toBeVisible();
  }
}
