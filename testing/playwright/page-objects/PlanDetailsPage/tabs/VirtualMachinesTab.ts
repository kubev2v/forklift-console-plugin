import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';
import { Table } from '../../common/Table';

export class VirtualMachinesTab {
  private readonly table: Table;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(page, page.locator('main'));
  }

  get cancelButton() {
    return this.page.getByTestId('modal-cancel-button');
  }

  get editTargetNameMenuItem() {
    return this.page.getByTestId('edit-vm-target-name-menu-item');
  }

  get editTargetPowerStateModal() {
    return this.page.getByRole('dialog', { name: 'Edit target power state' });
  }

  async enableColumn(columnName: string): Promise<void> {
    await this.table.enableColumn(columnName);
  }

  async getTableCell(rowColumnName: string, rowValue: string, targetColumnName: string) {
    const vmRow = this.table.getRow({ [rowColumnName]: rowValue });

    // Get table headers to find the column index
    const tableContainer = this.page.locator('[role="grid"]');
    const headers = await tableContainer
      .locator('thead th, thead [role="columnheader"]')
      .allTextContents();

    const targetIndex = headers.findIndex((header) => header?.trim() === targetColumnName);
    if (targetIndex === -1) {
      throw new Error(`Column "${targetColumnName}" not found`);
    }

    return vmRow.locator(`td:nth-child(${targetIndex + 1})`);
  }

  getVMActionsMenu(vmName: string) {
    const vmRow = this.table.getRow({ Name: vmName });
    return vmRow.getByTestId('vm-actions-menu-toggle');
  }

  async getVMPowerState(vmName: string): Promise<string> {
    const powerStateCell = await this.getTableCell('Name', vmName, 'Target power state');
    const powerStateText = await powerStateCell.textContent();
    return powerStateText?.trim() ?? '';
  }

  async isColumnVisible(columnName: string): Promise<boolean> {
    return this.table.isColumnVisible(columnName);
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    const virtualMachinesTab = this.page.locator(
      '[data-test-id="horizontal-link-Virtual machines"]',
    );
    await virtualMachinesTab.click();
    await this.page.waitForURL((url) => url.toString().endsWith('/vms'));
  }

  async openPowerStateDialog(vmName: string): Promise<void> {
    await this.getVMActionsMenu(vmName).waitFor({ state: 'visible' });
    await this.getVMActionsMenu(vmName).click();

    const editPowerStateMenuItem = this.page.getByTestId('edit-vm-target-power-state-menu-item');
    await editPowerStateMenuItem.waitFor({ state: 'visible' });
    await editPowerStateMenuItem.click();

    await this.editTargetPowerStateModal.waitFor({ state: 'visible' });
  }

  async openRenameDialog(vmName: string): Promise<void> {
    const modalCancelButton = this.page.getByTestId('modal-cancel-button');
    // Intentionally ignore errors if modal is not present
    await modalCancelButton.click({ timeout: 1000 }).catch(() => undefined);

    await this.getVMActionsMenu(vmName).click();

    const editMenuItem = this.page.getByTestId('edit-vm-target-name-menu-item');
    await editMenuItem.waitFor({ state: 'visible' });
    await editMenuItem.click();

    await this.renameTargetNameInput.waitFor({ state: 'visible' });
    await this.renameTargetNameInput.waitFor({ state: 'attached' });
    await this.renameTargetNameInput.focus();
  }

  get powerStateModalSaveButton() {
    return this.editTargetPowerStateModal.getByRole('button', { name: 'Save target power state' });
  }

  get powerStateModalSelect() {
    return this.editTargetPowerStateModal.getByTestId('target-power-state-select');
  }

  get powerStateOptionAuto() {
    return this.editTargetPowerStateModal.getByTestId('power-state-option-auto');
  }

  get powerStateOptionInherit() {
    return this.editTargetPowerStateModal.getByTestId('power-state-option-inherit');
  }

  get powerStateOptionOff() {
    return this.editTargetPowerStateModal.getByTestId('power-state-option-off');
  }

  get powerStateOptionOn() {
    return this.editTargetPowerStateModal.getByTestId('power-state-option-on');
  }

  get renameTargetNameInput() {
    return this.page.getByTestId('vm-target-name-input');
  }

  async renameVM(sourceName: string, targetName: string): Promise<void> {
    await this.table.search(sourceName);

    const vmRow = this.table.getRow({ Name: sourceName });
    await expect(vmRow).toBeVisible({ timeout: 2000 });

    const actionsButton = vmRow.getByTestId('vm-actions-menu-toggle');
    await actionsButton.click();

    const renameOption = this.page.getByTestId('edit-vm-target-name-menu-item');
    await renameOption.click();

    const nameInput = this.page.getByTestId('vm-target-name-input');
    await nameInput.fill(targetName);

    const saveButton = this.page.getByRole('button', { name: /save|confirm|rename/iu });
    await saveButton.click();

    await this.page.waitForTimeout(1000);

    await this.table.search(sourceName);
    await this.table.verifyRowIsVisible({ Name: sourceName });

    const renamedVmRow = this.table.getRow({ Name: sourceName });
    const renamedActionsButton = renamedVmRow.getByTestId('vm-actions-menu-toggle');
    await renamedActionsButton.click();

    const verifyRenameOption = this.page.getByTestId('edit-vm-target-name-menu-item');
    await verifyRenameOption.click();

    const verifyNameInput = this.page.getByTestId('vm-target-name-input');
    await expect(verifyNameInput).toHaveValue(targetName);

    const cancelButton = this.page.getByTestId('modal-cancel-button');
    await cancelButton.click();

    await this.table.clearAllFilters();
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save|confirm/iu });
  }

  get validationErrorMessage() {
    return this.page.getByTestId('form-helper-text-error');
  }

  async verifyRowIsVisible(options: Record<string, string>): Promise<void> {
    await this.table.verifyRowIsVisible(options);
  }

  async verifyVirtualMachinesTab(planData: PlanTestData): Promise<void> {
    await this.table.waitForTableLoad();

    if (planData.virtualMachines?.length) {
      for (const vm of planData.virtualMachines) {
        await this.table.verifyRowIsVisible({ Name: vm.sourceName });
      }
    }
  }
}
