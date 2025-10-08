import { expect, type Locator, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';

export class AdditionalSettingsStep {
  private readonly page: Page;
  readonly powerStateOptionAuto: Locator;
  readonly powerStateOptionOff: Locator;
  readonly powerStateOptionOn: Locator;
  readonly targetPowerStateSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.targetPowerStateSelect = page.getByTestId('target-power-state-select');
    this.powerStateOptionAuto = page.getByTestId('power-state-option-auto');
    this.powerStateOptionOn = page.getByTestId('power-state-option-on');
    this.powerStateOptionOff = page.getByTestId('power-state-option-off');
  }

  async fillAndComplete(
    additionalPlanSettings: PlanTestData['additionalPlanSettings'],
  ): Promise<void> {
    if (additionalPlanSettings?.targetPowerState) {
      await this.targetPowerStateSelect.click();
      await this.powerStateOption(additionalPlanSettings.targetPowerState).click();
    }
  }

  powerStateOption(state: 'on' | 'off' | 'auto'): Locator {
    return this.page.getByTestId(`power-state-option-${state}`);
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Other settings' })).toBeVisible();
  }
}
