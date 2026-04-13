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
    this.addScriptButton = this.page.getByTestId('add-script-button');
  }

  async addScript(): Promise<void> {
    await this.addScriptButton.click();
  }

  async configureScript(index: number, config: ScriptConfig): Promise<void> {
    await fillScriptFields(this.page, index, config, MODAL_FIELD_TEST_IDS);
  }

  async getScriptCount(): Promise<number> {
    return await this.page.locator('[data-testid^="script-edit-row-"]').count();
  }

  async removeScript(index: number): Promise<void> {
    await this.page.getByTestId(`remove-script-${index}`).click();
  }
}
