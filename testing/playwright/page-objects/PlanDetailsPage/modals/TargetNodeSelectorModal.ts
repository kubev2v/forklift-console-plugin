import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

export class TargetNodeSelectorModal extends BaseModal {
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page, 'node-selector-modal');
    this.addButton = this.modal.getByRole('button', { name: /add/i });
  }

  async addNodeSelector(key: string, value: string): Promise<void> {
    await this.addButton.click();

    const keyInputs = this.modal.getByTestId('node-selector-key-input');
    const valueInputs = this.modal.getByTestId('node-selector-value-input');

    const keyInput = keyInputs.last();
    await keyInput.waitFor({ state: 'visible' });
    await keyInput.fill(key);

    const valueInput = valueInputs.last();
    await valueInput.waitFor({ state: 'visible' });
    await valueInput.fill(value);
  }

  async deleteNodeSelectorByKey(key: string): Promise<void> {
    const keyInputs = this.modal.getByTestId('node-selector-key-input');
    const count = await keyInputs.count();

    for (let i = 0; i < count; i += 1) {
      const inputValue = await keyInputs.nth(i).inputValue();
      if (inputValue === key) {
        const deleteButton = this.modal
          .locator('button')
          .filter({ has: this.page.locator('svg') })
          .nth(i);
        await deleteButton.click();
        break;
      }
    }
  }

  async verifyNodeSelectorExists(key: string, value: string): Promise<void> {
    const keyInputs = this.modal.getByTestId('node-selector-key-input');
    const valueInputs = this.modal.getByTestId('node-selector-value-input');
    const count = await keyInputs.count();

    let found = false;
    for (let i = 0; i < count; i += 1) {
      const keyValue = await keyInputs.nth(i).inputValue();
      if (keyValue === key) {
        const valueValue = await valueInputs.nth(i).inputValue();
        expect(valueValue).toBe(value);
        found = true;
        break;
      }
    }

    expect(found).toBe(true);
  }
}
