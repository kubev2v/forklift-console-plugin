import { expect, type Locator, type Page } from '@playwright/test';

import {
  type CustomizationScriptsTestData,
  GUEST_TYPE_LABELS,
  SCRIPT_TYPE_LABELS,
  type ScriptConfig,
} from '../../../types/test-data';

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
    await this.page.getByTestId(`script-name-${index}`).fill(config.name);

    if (config.guestType) {
      const select = this.page.getByTestId(`script-guest-type-${index}`);
      await select.click();
      await this.page.getByRole('option', { name: GUEST_TYPE_LABELS[config.guestType] }).click();
    }

    if (config.scriptType) {
      const select = this.page.getByTestId(`script-type-${index}`);
      await select.click();
      await this.page.getByRole('option', { name: SCRIPT_TYPE_LABELS[config.scriptType] }).click();
    }

    if (config.content) {
      await this.page.evaluate(
        ({ idx, scriptContent }) => {
          const editors = (globalThis as any).monaco?.editor?.getEditors?.();
          if (editors && Array.isArray(editors) && editors.length > idx) {
            editors[idx].setValue(scriptContent);
          }
        },
        { idx: index, scriptContent: config.content },
      );
    }
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
