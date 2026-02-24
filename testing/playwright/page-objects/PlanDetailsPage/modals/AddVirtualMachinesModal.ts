import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

export class AddVirtualMachinesModal extends BaseModal {
  constructor(page: Page) {
    super(page, page.getByRole('dialog'));
  }

  private getVmRow(vmName: string): Locator {
    return this.treegrid.getByRole('row').filter({
      has: this.page.getByText(vmName, { exact: true }),
    });
  }

  private get searchInput(): Locator {
    return this.modal.getByRole('textbox', { name: 'Search input' });
  }

  private get treegrid(): Locator {
    return this.modal.getByRole('treegrid');
  }

  async expandAllFolders(): Promise<void> {
    const expandButtons = this.treegrid.getByRole('button', { name: /Expand row/ });
    const count = await expandButtons.count();

    for (let i = 0; i < count; i += 1) {
      await expandButtons.nth(i).click();
    }
  }

  async getRowCount(): Promise<number> {
    const allRows = await this.treegrid.getByRole('row').count();

    return Math.max(0, allRows - 1);
  }

  async search(vmName: string): Promise<void> {
    await this.searchInput.fill(vmName);
    await this.searchInput.press('Enter');
  }

  async selectVirtualMachine(vmName: string): Promise<void> {
    await this.search(vmName);
    await this.expandAllFolders();
    await this.getVmRow(vmName).first().getByRole('checkbox').check();
  }

  async verifyModalTitle(): Promise<void> {
    await expect(this.modal).toContainText('Add virtual machines to migration plan');
  }

  async verifyVmInTable(vmName: string): Promise<void> {
    await this.search(vmName);
    await this.expandAllFolders();
    await expect(this.getVmRow(vmName).first()).toBeVisible();
  }

  async verifyVmNotInTable(vmName: string): Promise<void> {
    await this.search(vmName);
    await expect(this.getVmRow(vmName).first()).not.toBeVisible();
  }

  override async waitForModalToOpen(): Promise<void> {
    await super.waitForModalToOpen();
    await expect(this.treegrid).toBeVisible();
    await expect(this.treegrid.getByRole('row').first()).toBeVisible();
  }
}
