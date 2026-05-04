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

  async isConfirmDisabled(): Promise<boolean> {
    return this.confirmButton.isDisabled();
  }

  get modal(): Locator {
    return this.page.getByTestId('inspect-vms-modal');
  }

  async selectVmByName(vmName: string): Promise<void> {
    const row = this.vmTable.locator('tr', { hasText: vmName });
    await row.locator('input[type="checkbox"]').check();
  }

  get techPreviewLabel(): Locator {
    return this.modal.locator('text=Technology Preview');
  }

  get vmTable(): Locator {
    return this.page.getByTestId('inspection-vm-table');
  }

  async waitForModalOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async waitForVmTableLoaded(): Promise<void> {
    await expect(this.vmTable).toBeVisible();
    await expect(this.vmTable.locator('tbody tr').first()).toBeVisible({ timeout: 30_000 });
  }
}
