import type { Locator, Page } from '@playwright/test';

import type { ScriptConfig } from '../../../types/test-data';
import { fillScriptFields } from '../../../utils/script-form-helpers';
import { V5_0_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { BaseModal } from '../../common/BaseModal';

/** 2.12 details modal uses distinct *-input / *-select test ids. */
const V2_12_SCRIPT_FIELD_TEST_IDS = {
  guestTypeSelect: (i: number): string => `script-guest-type-select-${i}`,
  nameInput: (i: number): string => `script-name-input-${i}`,
  scriptTypeSelect: (i: number): string => `script-type-select-${i}`,
};

/** 5.0+ details edit shares getScriptFieldInputs with the plan-create wizard. */
const V5_SCRIPT_FIELD_TEST_IDS = {
  guestTypeSelect: (i: number): string => `script-guest-type-${i}`,
  nameInput: (i: number): string => `script-name-${i}`,
  scriptTypeSelect: (i: number): string => `script-type-${i}`,
};

export class ScriptEditModal extends BaseModal {
  readonly addScriptButton: Locator;

  constructor(page: Page) {
    super(page, page.getByTestId('script-edit-modal'));
    this.addScriptButton = this.modal.getByTestId('add-mapping-button');
  }

  async addScript(): Promise<void> {
    await this.addScriptButton.click();
  }

  async configureScript(index: number, config: ScriptConfig): Promise<void> {
    await fillScriptFields(
      this.page,
      index,
      config,
      isVersionAtLeast(V5_0_0) ? V5_SCRIPT_FIELD_TEST_IDS : V2_12_SCRIPT_FIELD_TEST_IDS,
    );
  }

  getScriptCount(): Promise<number> {
    return this.modal.locator('[data-testid^="field-row-"]').count();
  }

  async removeScript(index: number): Promise<void> {
    await this.modal.getByTestId(`remove-row-${index}`).click();
  }

  async setScripts(scripts: ScriptConfig[]): Promise<void> {
    const existingCount = await this.getScriptCount();
    const reusable = Math.min(existingCount, scripts.length);

    for (let i = 0; i < reusable; i += 1) {
      await this.configureScript(i, scripts[i]);
    }

    for (let i = reusable; i < scripts.length; i += 1) {
      await this.addScript();
      await this.configureScript(i, scripts[i]);
    }

    for (let i = existingCount - 1; i >= scripts.length; i -= 1) {
      await this.removeScript(i);
    }
  }
}
