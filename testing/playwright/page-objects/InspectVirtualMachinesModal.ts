import { expect, type Locator, type Page } from '@playwright/test';

export class InspectVirtualMachinesModal {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get cancelButton(): Locator {
    return this.page.getByTestId('modal-cancel-button');
  }

  async clickInspect(): Promise<void> {
    await this.confirmButton.click();
  }

  async close(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.modal).not.toBeVisible();
  }

  get confirmButton(): Locator {
    return this.page.getByTestId('modal-confirm-button');
  }

  async getConfirmButtonText(): Promise<string> {
    return (await this.confirmButton.textContent()) ?? '';
  }

  async getVmInspectionStatus(vmName: string): Promise<string> {
    const row = this.vmTable.getByRole('row', { name: new RegExp(vmName) });
    const statusCell = row.getByRole('gridcell').last();
    return (await statusCell.textContent())?.trim() ?? '';
  }

  async getVmRowCount(): Promise<number> {
    const body = this.vmTable.getByRole('rowgroup').nth(1);
    return await body.getByRole('row').count();
  }

  async isConfirmDisabled(): Promise<boolean> {
    return await this.confirmButton.isDisabled();
  }

  get modal(): Locator {
    return this.page.getByTestId('inspect-vms-modal');
  }

  async selectAllVms(): Promise<void> {
    const selectAllCheckbox = this.modal.getByRole('checkbox', { name: 'Select page' });
    await selectAllCheckbox.check();
  }

  async selectVmByName(vmName: string): Promise<void> {
    const row = this.vmTable.getByRole('row', { name: new RegExp(vmName) });
    await row.getByRole('checkbox').check();
  }

  get techPreviewLabel(): Locator {
    return this.modal.locator('text=Technology Preview');
  }

  get vmTable(): Locator {
    return this.modal.getByRole('grid', { name: 'Page table' });
  }

  async waitForModalOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async waitForVmTableLoaded(): Promise<void> {
    await expect(this.vmTable).toBeVisible();
    await expect(this.vmTable.locator('tbody tr').first()).toBeVisible({ timeout: 30_000 });
  }
}
