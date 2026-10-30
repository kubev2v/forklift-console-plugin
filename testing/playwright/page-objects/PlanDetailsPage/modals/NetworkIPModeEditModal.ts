import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

const MODAL_TEST_ID = 'edit-network-ip-mode-modal';
const MODE_SELECT_TEST_ID_PREFIX = 'network-ip-mode-select-';

export class NetworkIPModeEditModal extends BaseModal {
  constructor(page: Page) {
    super(page, MODAL_TEST_ID);
  }

  private mappingRow(targetNetwork: string): Locator {
    return this.modal.getByRole('row').filter({ hasText: targetNetwork });
  }

  private modeSelect(targetNetwork: string): Locator {
    return this.mappingRow(targetNetwork).locator(`[data-testid^="${MODE_SELECT_TEST_ID_PREFIX}"]`);
  }

  async selectMode(targetNetwork: string, modeLabel: string): Promise<void> {
    await this.modeSelect(targetNetwork).click();
    await this.page.getByRole('option', { exact: true, name: modeLabel }).click();
  }

  async verifyModalStructure(): Promise<void> {
    await expect(this.modal).toBeVisible();
    await expect(this.modal.getByRole('grid', { name: 'Network IP mode mappings' })).toBeVisible();
  }

  async verifyMode(targetNetwork: string, modeLabel: string): Promise<void> {
    await expect(this.modeSelect(targetNetwork)).toContainText(modeLabel);
  }

  async verifyModeSelectorDisabled(targetNetwork: string): Promise<void> {
    await expect(this.modeSelect(targetNetwork)).toBeDisabled();
  }
}
