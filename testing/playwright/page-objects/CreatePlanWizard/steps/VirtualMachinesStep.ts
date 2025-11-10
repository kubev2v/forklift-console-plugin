import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../../fixtures/test-data';
import type { VirtualMachine } from '../../../types/test-data';
import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';

export class VirtualMachinesStep extends VirtualMachinesTable {
  constructor(page: Page) {
    super(page, page.getByTestId('create-plan-vm-step'));
  }

  async fillAndComplete(
    virtualMachines?: VirtualMachine[],
    criticalIssuesAction?: 'confirm' | 'deselect',
  ): Promise<void> {
    await this.verifyStepVisible();
    await this.verifyTableLoaded();

    if (virtualMachines === undefined) {
      await this.selectFirstVirtualMachine();
    } else {
      for (const vm of virtualMachines) {
        // If VM name is empty but folder is specified, select the folder
        if (!vm.sourceName && vm.folder) {
          await this.selectFolder(vm.folder);
        } else if (vm.sourceName) {
          await this.searchAndSelectVirtualMachine(vm.sourceName, vm.folder);
        }
      }
    }

    // Handle critical issues modal if needed (appears after selecting VMs with critical issues)
    if (criticalIssuesAction) {
      await this.handleCriticalIssuesModal(criticalIssuesAction);
    }
  }

  /**
   * Gets the names of all currently selected VMs
   * @returns Array of selected VM names
   */
  async getSelectedVMNames(): Promise<string[]> {
    const selectedVMNames: string[] = [];

    // Find all VM rows (not folders) with checked checkboxes
    // VM rows have data-testid starting with "vm-"
    const table = this.page.getByTestId('vsphere-tree-table');
    const vmRows = table.locator('tbody tr[data-testid^="vm-"]');

    const count = await vmRows.count();
    for (let i = 0; i < count; i += 1) {
      const row = vmRows.nth(i);

      // Check if the checkbox is checked
      const checkbox = row.locator('input[type="checkbox"]');
      const isChecked = await checkbox.isChecked().catch(() => false);

      if (isChecked) {
        // Get the VM name from the name cell using data-testid
        const testId = await row.getAttribute('data-testid');
        const nameCell = row.getByTestId(`${testId}-name-cell`);
        const vmNameText = await nameCell.textContent().catch(() => '');

        if (vmNameText) {
          selectedVMNames.push(vmNameText.trim());
        }
      }
    }

    return selectedVMNames;
  }

  async handleCriticalIssuesModal(action: 'confirm' | 'deselect'): Promise<void> {
    const buttonName = action === 'confirm' ? 'Confirm selections' : 'Deselect critical issue VMs';
    const button = this.page.getByRole('button', { name: buttonName });

    await expect(button).toBeVisible();
    await button.click();

    // Wait for modal to disappear
    await expect(button).not.toBeVisible();
  }

  async searchAndSelectVirtualMachine(vmName: string, folder?: string) {
    await this.search(vmName);

    // Expand the VM folder if it exists
    if (folder) {
      await this.expandFolder(folder);
    }

    await this.table.selectRow({ Name: vmName });
  }

  async selectFirstVirtualMachine() {
    const grid = this.page.getByRole('treegrid');
    const firstRow = grid.locator('tbody tr').first();
    const checkbox = firstRow.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async selectFolder(folder: string): Promise<void> {
    const folderRow = this.page.getByTestId(`folder-${folder}`);
    await expect(folderRow).toBeVisible();

    const checkbox = folderRow.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async selectVirtualMachine(vmName: string) {
    await this.table.selectRow({ Name: vmName });
  }

  async verifyStepVisible() {
    await expect(this.page.getByTestId('create-plan-vm-step')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(
      API_ENDPOINTS.virtualMachines('vsphere', TEST_DATA.providers.source.uid),
    );
    await this.page.waitForResponse(API_ENDPOINTS.storageClasses(TEST_DATA.providers.target.uid));
  }
}
