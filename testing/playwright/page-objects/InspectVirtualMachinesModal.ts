import { expect, type Locator, type Page } from '@playwright/test';

import { V5_0_0 } from '../utils/version/constants';
import { isVersionAtLeast } from '../utils/version/version';

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

  getVmRowCount(): Promise<number> {
    return this.vmTableBodyRows.count();
  }

  isConfirmDisabled(): Promise<boolean> {
    return this.confirmButton.isDisabled();
  }

  isVmCheckboxChecked(vmName: string): Promise<boolean> {
    return this.vmCheckbox(vmName).isChecked();
  }

  isVmCheckboxDisabled(vmName: string): Promise<boolean> {
    return this.vmCheckbox(vmName).isDisabled();
  }

  get modal(): Locator {
    return this.page.getByTestId('inspect-vms-modal');
  }

  /**
   * 5.0+ (#2890) has data-testid on the BulkSelect checkbox. 2.12 does not, but
   * TableBulkSelect still sets id="bulk-select-toggle-checkbox". Scope to the
   * modal because the plan VM table behind the overlay uses the same id.
   * Avoid the translated "Select page" aria-label (breaks i18n / MTV-6613).
   */
  get selectAllCheckbox(): Locator {
    return isVersionAtLeast(V5_0_0)
      ? this.modal.getByTestId('table-bulk-select-checkbox')
      : this.modal.locator('#bulk-select-toggle-checkbox');
  }

  async selectAllVms(): Promise<void> {
    await this.selectAllCheckbox.check();
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
