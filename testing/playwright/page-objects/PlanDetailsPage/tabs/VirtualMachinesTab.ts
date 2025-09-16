import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';
import { Table } from '../../common/Table';

export class VirtualMachinesTab {
  private readonly table: Table;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(page, page.locator('main')); // Use main as root locator for the table
  }

  get cancelButton() {
    return this.page.getByTestId('modal-cancel-button');
  }

  get editTargetNameMenuItem() {
    return this.page.getByTestId('edit-vm-target-name-menu-item');
  }

  getVMActionsMenu(vmName: string) {
    const vmRow = this.table.getRow({ Name: vmName });
    return vmRow.getByTestId('vm-actions-menu-toggle');
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    const virtualMachinesTab = this.page.locator(
      '[data-test-id="horizontal-link-Virtual machines"]',
    );
    await virtualMachinesTab.click();
    await this.page.waitForURL((url) => url.toString().endsWith('/vms'));
  }

  async openRenameDialog(vmName: string): Promise<void> {
    const modalCancelButton = this.page.getByTestId('modal-cancel-button');
    await modalCancelButton.click({ timeout: 1000 }).catch(() => {
      // Modal doesn't exist or isn't clickable
    });
    await this.page.waitForTimeout(500);

    await this.getVMActionsMenu(vmName).click();

    const editMenuItem = this.page.getByTestId('edit-vm-target-name-menu-item');
    await editMenuItem.waitFor({ state: 'visible' });
    await editMenuItem.click();

    await this.renameTargetNameInput.waitFor({ state: 'visible' });
    await this.renameTargetNameInput.waitFor({ state: 'attached' });
    await this.renameTargetNameInput.focus();
  }
  get renameTargetNameInput() {
    return this.page.getByTestId('vm-target-name-input');
  }

  async renameVM(sourceName: string, targetName: string): Promise<void> {
    await this.table.search(sourceName);

    const vmRow = this.table.getRow({ Name: sourceName });
    await expect(vmRow).toBeVisible({ timeout: 1000 });

    const actionsButton = vmRow.getByTestId('vm-actions-menu-toggle');
    await actionsButton.click();

    const renameOption = this.page.getByTestId('edit-vm-target-name-menu-item');
    await renameOption.click();

    const nameInput = this.page.getByTestId('vm-target-name-input');
    await nameInput.fill(targetName);

    const saveButton = this.page.getByRole('button', { name: /save|confirm|rename/i });
    await saveButton.click();

    await this.page.waitForTimeout(2000);

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
    return this.page.getByRole('button', { name: /save|confirm/i });
  }

  get validationErrorMessage() {
    return this.page.getByTestId('form-helper-text-error');
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
