import { expect, type Locator, type Page } from '@playwright/test';

import { GUEST_TYPE_LABELS, SCRIPT_TYPE_LABELS, type ScriptConfig } from '../../../types/test-data';
import { BaseModal } from '../../common/BaseModal';

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
    const nameInput = this.page.getByTestId(`script-name-input-${index}`);
    await nameInput.clear();
    await nameInput.fill(config.name);

    if (config.guestType) {
      const select = this.page.getByTestId(`script-guest-type-select-${index}`);
      await select.click();
      await this.page.getByRole('option', { name: GUEST_TYPE_LABELS[config.guestType] }).click();
    }

    if (config.scriptType) {
      const select = this.page.getByTestId(`script-type-select-${index}`);
      await select.click();
      await this.page.getByRole('option', { name: SCRIPT_TYPE_LABELS[config.scriptType] }).click();
    }

    if (config.content) {
      await this.setScriptContent(index, config.content);
    }
  }

  async getScriptCount(): Promise<number> {
    return await this.page.locator('[data-testid^="script-edit-row-"]').count();
  }

  async removeScript(index: number): Promise<void> {
    await this.page.getByTestId(`remove-script-${index}`).click();
  }

  async setScriptContent(index: number, content: string): Promise<void> {
    const success = await this.page.evaluate(
      ({ idx, scriptContent }) => {
        const editors = (globalThis as any).monaco?.editor?.getEditors?.();
        if (editors && Array.isArray(editors) && editors.length > idx) {
          editors[idx].setValue(scriptContent);
          return true;
        }
        return false;
      },
      { idx: index, scriptContent: content },
    );

    if (!success) {
      throw new Error(`Failed to set script content at index ${index} - Monaco editor not found`);
    }
  }

  async verifyScriptName(index: number, expectedName: string): Promise<void> {
    const nameInput = this.page.getByTestId(`script-name-input-${index}`);
    await expect(nameInput).toHaveValue(expectedName);
  }
}
