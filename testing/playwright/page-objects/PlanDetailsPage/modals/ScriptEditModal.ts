import type { Locator, Page } from '@playwright/test';

import type { ScriptConfig } from '../../../types/test-data';
import { fillScriptFields } from '../../../utils/script-form-helpers';
import { BaseModal } from '../../common/BaseModal';

const MODAL_FIELD_TEST_IDS = {
  guestTypeSelect: (i: number): string => `script-guest-type-select-${i}`,
  nameInput: (i: number): string => `script-name-input-${i}`,
  scriptTypeSelect: (i: number): string => `script-type-select-${i}`,
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
    await fillScriptFields(this.page, index, config, MODAL_FIELD_TEST_IDS);
  }

  async getScriptCount(): Promise<number> {
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
