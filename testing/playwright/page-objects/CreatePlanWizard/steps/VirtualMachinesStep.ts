import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../../fixtures/test-data';
import type { VirtualMachine } from '../../../types/test-data';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';

export class VirtualMachinesStep extends VirtualMachinesTable {
  constructor(page: Page) {
    super(page, page.getByTestId('create-plan-vm-step'));
  }

  async expandFolderForLegacy(folder: string): Promise<void> {
    const treegrid = this.rootLocator.getByRole('treegrid');
    const folderRow = treegrid.getByRole('row').filter({
      has: this.page.getByText(folder, { exact: true }),
    });
    const expandButton = folderRow.first().getByRole('button', { name: /Expand row/i });
    if (await expandButton.isVisible().catch(() => false)) {
      const expanded = await expandButton.getAttribute('aria-expanded');
      if (expanded === 'false') {
        await expandButton.click();
      }
    }
  }

  async fillAndComplete(virtualMachines?: VirtualMachine[]): Promise<void> {
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

    // Modal may or may not appear depending on whether selected VMs have critical issues
    const isVisible = await button.isVisible().catch(() => false);

    if (isVisible) {
      await button.click();
      // Wait for modal to disappear
      await expect(button).not.toBeVisible();
    }
  }

  async searchAndSelectVirtualMachine(vmName: string, folder?: string) {
    await this.search(vmName);

    if (folder) {
      if (isVersionAtLeast(V2_11_0)) {
        await this.expandFolder(folder);
      } else {
        await this.expandFolderForLegacy(folder);
      }
    }

    if (isVersionAtLeast(V2_11_0)) {
      await this.table.selectRow({ Name: vmName });
    } else {
      // 2.10.x: treegrid uses role="row"; rows contain checkbox "Row N checkbox" and VM name in rowheader
      const treegrid = this.rootLocator.getByRole('treegrid');
      const row = treegrid.getByRole('row').filter({
        has: this.page.getByText(vmName, { exact: true }),
      });
      await row.first().getByRole('checkbox').check();
    }
  }

  async selectFirstVirtualMachine() {
    const grid = this.page.getByRole('treegrid');
    const firstRow = grid.locator('tbody tr').first();
    const checkbox = firstRow.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async selectFolder(folder: string): Promise<void> {
    if (isVersionAtLeast(V2_11_0)) {
      const folderRow = this.page.getByTestId(`folder-${folder}`);
      await expect(folderRow).toBeVisible();
      const checkbox = folderRow.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
      await checkbox.check();
    } else {
      const treegrid = this.rootLocator.getByRole('treegrid');
      const folderRow = treegrid.getByRole('row').filter({
        has: this.page.getByText(folder, { exact: true }),
      });
      await expect(folderRow.first()).toBeVisible();
      await folderRow.first().getByRole('checkbox').check();
    }
  }

  async selectVirtualMachine(vmName: string) {
    await this.table.selectRow({ Name: vmName });
  }

  async verifyStepVisible() {
    await expect(this.page.getByTestId('create-plan-vm-step')).toBeVisible();
  }

  override async verifyTableLoaded(): Promise<void> {
    const treegrid = this.rootLocator.getByRole('treegrid');
    await expect(treegrid).toBeVisible({ timeout: 30000 });
    if (isVersionAtLeast(V2_11_0)) {
      await this.table.waitForTableLoad();
    } else {
      await expect(treegrid.getByRole('row').first()).toBeVisible();
    }
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(
      API_ENDPOINTS.virtualMachines('vsphere', TEST_DATA.providers.source.uid),
    );
    await this.page.waitForResponse(API_ENDPOINTS.storageClasses(TEST_DATA.providers.target.uid));
  }
}
