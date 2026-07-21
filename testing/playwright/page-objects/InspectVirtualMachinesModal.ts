import { expect, type Locator, type Page } from '@playwright/test';

export class InspectVirtualMachinesModal {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private vmCheckbox(vmName: string): Locator {
    const row = this.vmTable.getByRole('row', { exact: false, name: vmName });
    return row.getByRole('checkbox');
  }

  private get vmTableBodyRows(): Locator {
    return this.vmTable.getByRole('rowgroup').nth(1).getByRole('row');
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

  async getEligibleVmCount(): Promise<number> {
    const rows = this.vmTableBodyRows;
    const rowCount = await rows.count();
    let eligibleCount = 0;

    for (let i = 0; i < rowCount; i += 1) {
      const checkbox = rows.nth(i).getByRole('checkbox');
      if (!(await checkbox.isDisabled())) {
        eligibleCount += 1;
      }
    }

    return eligibleCount;
  }

  async getVmInspectionStatus(vmName: string): Promise<string> {
    const row = this.vmTable.getByRole('row', { exact: false, name: vmName });
    const statusCell = row.getByRole('gridcell').last();
    return (await statusCell.textContent())?.trim() ?? '';
  }

  async getVmRowCount(): Promise<number> {
    return this.vmTableBodyRows.count();
  }

  async isConfirmDisabled(): Promise<boolean> {
    return this.confirmButton.isDisabled();
  }

  async isVmCheckboxChecked(vmName: string): Promise<boolean> {
    return this.vmCheckbox(vmName).isChecked();
  }

  async isVmCheckboxDisabled(vmName: string): Promise<boolean> {
    return this.vmCheckbox(vmName).isDisabled();
  }

  get modal(): Locator {
    return this.page.getByTestId('inspect-vms-modal');
  }

  async selectAllVms(): Promise<void> {
    const selectAllCheckbox = this.modal.getByRole('checkbox', { name: 'Select page' });
    await selectAllCheckbox.check();
  }

  /**
   * Selects the first VM whose checkbox is not disabled and returns its name.
   * Useful when the test does not know VM names upfront (e.g. dynamically created plans).
   */
  async selectFirstEligibleVm(): Promise<string> {
    const rows = this.vmTableBodyRows;
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i += 1) {
      const row = rows.nth(i);
      const checkbox = row.getByRole('checkbox');
      if (!(await checkbox.isDisabled())) {
        const vmName = (await row.getByRole('gridcell').nth(1).textContent())?.trim() ?? '';
        await checkbox.check();
        return vmName;
      }
    }

    throw new Error('No eligible VMs found for inspection');
  }

  async selectVmByName(vmName: string): Promise<void> {
    await this.vmCheckbox(vmName).check();
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
    await expect(this.vmTableBodyRows.first()).toBeVisible({ timeout: 30_000 });
  }
}
