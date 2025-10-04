import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

export class TargetLabelsModal extends BaseModal {
  readonly labelInput: Locator;

  constructor(page: Page) {
    super(page, 'labels-modal');
    this.labelInput = this.modal.getByRole('textbox');
  }

  async addLabel(key: string, value: string): Promise<void> {
    await this.labelInput.fill(`${key}=${value}`);
    await this.labelInput.press('Enter');
  }

  async deleteLabelByKey(key: string): Promise<void> {
    const label = this.modal.locator('.pf-v5-c-label').filter({ hasText: key });
    const closeButton = label.getByRole('button', { name: new RegExp(`Close ${key}`, 'i') });
    await closeButton.click();
  }

  async verifyLabelExists(key: string, value: string): Promise<void> {
    const labelText = `${key}=${value}`;
    const label = this.modal.locator('.pf-v5-c-label').filter({ hasText: labelText });
    await expect(label).toBeVisible();
  }
}
