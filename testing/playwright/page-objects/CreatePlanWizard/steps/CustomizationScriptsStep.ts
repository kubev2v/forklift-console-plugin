import { expect, type Locator, type Page } from '@playwright/test';

import type { CustomizationScriptsTestData, ScriptConfig } from '../../../types/test-data';
import { fillScriptFields } from '../../../utils/script-form-helpers';

const WIZARD_FIELD_TEST_IDS = {
  guestTypeSelect: (i: number): string => `script-guest-type-${i}`,
  nameInput: (i: number): string => `script-name-${i}`,
  scriptTypeSelect: (i: number): string => `script-type-${i}`,
};

export class CustomizationScriptsStep {
  private readonly page: Page;

  readonly addScriptButton: Locator;
  readonly createNewScriptsRadio: Locator;
  readonly existingConfigMapRadio: Locator;

  constructor(page: Page) {
    this.page = page;
    this.existingConfigMapRadio = page.getByTestId('use-existing-configmap-radio');
    this.createNewScriptsRadio = page.getByTestId('use-new-scripts-radio');
    this.addScriptButton = page.getByTestId('add-mapping-button');
  }

  private async configureScript(index: number, config: ScriptConfig): Promise<void> {
    await fillScriptFields(this.page, index, config, WIZARD_FIELD_TEST_IDS);
  }

  private async selectConfigMap(name: string): Promise<void> {
    const toggle = this.page.getByTestId('configmap-select');
    await toggle.click();
    await this.page.getByRole('option', { name }).click();
  }

  async fillAndComplete(config?: CustomizationScriptsTestData): Promise<void> {
    await this.verifyStepVisible();

    if (!config) {
      return;
    }

    if (config.mode === 'existing') {
      await this.existingConfigMapRadio.click();
      await this.selectConfigMap(config.configMapName);
      return;
    }

    await this.createNewScriptsRadio.click();
    await expect(this.addScriptButton).toBeVisible();

    for (let i = 0; i < config.scripts.length; i += 1) {
      if (i > 0) {
        await this.addScriptButton.click();
        await this.page.getByTestId(`field-row-${i}`).waitFor({ state: 'visible' });
      }
      await this.configureScript(i, config.scripts[i]);
    }
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByTestId('create-plan-custom-scripts-step')).toBeVisible();
  }
}
