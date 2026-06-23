import { expect, type Locator, type Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../../fixtures/test-data';
import type { VirtualMachine } from '../../../types/test-data';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';

export class VirtualMachinesStep extends VirtualMachinesTable {
  constructor(page: Page) {
    super(page, page.getByTestId('create-plan-vm-step'));
  }

  private async getVmGrid(): Promise<Locator> {
    const treegrid = this.rootLocator.getByRole('treegrid');
    if (await treegrid.isVisible().catch(() => false)) {
      return treegrid;
    }
    return this.rootLocator.getByRole('grid');
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
        if (!vm.sourceName && vm.folder) {
          await this.selectFolder(vm.folder);
        } else if (vm.sourceName) {
          await this.searchAndSelectVirtualMachine(vm.sourceName, vm.folder);
        }
      }
    }
  }

  async getSelectedVMNames(): Promise<string[]> {
    const selectedVMNames: string[] = [];
    const table = this.page.getByTestId('vsphere-tree-table');
    const vmRows = table.locator('tbody tr[data-testid^="vm-"]');

    const count = await vmRows.count();
    for (let i = 0; i < count; i += 1) {
      const row = vmRows.nth(i);
      const checkbox = row.locator('input[type="checkbox"]');
      const isChecked = await checkbox.isChecked().catch(() => false);

      if (isChecked) {
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

    const isVisible = await button.isVisible().catch(() => false);

    if (isVisible) {
      await button.click();
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
      // Inventory API can be slow; 60s timeout prevents the default 15s firing before the row appears.
      const VM_ROW_TIMEOUT = 60_000;
      await expect(this.table.getRow({ Name: vmName })).toBeVisible({ timeout: VM_ROW_TIMEOUT });
      await this.table.selectRow({ Name: vmName });
    } else {
      const treegrid = this.rootLocator.getByRole('treegrid');
      const row = treegrid.getByRole('row').filter({
        has: this.page.getByText(vmName, { exact: true }),
      });
      await row.first().getByRole('checkbox').check();
    }
  }

  async selectFirstVirtualMachine() {
    const grid = await this.getVmGrid();
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
    const grid = this.rootLocator.getByRole('grid');
    const tableLocator = treegrid.or(grid);
    await expect(tableLocator).toBeVisible({ timeout: 30000 });
    if (isVersionAtLeast(V2_11_0)) {
      await this.table.waitForTableLoad();
    } else {
      await expect(tableLocator.getByRole('row').first()).toBeVisible();
    }
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(
      API_ENDPOINTS.virtualMachines('vsphere', TEST_DATA.providers.source.uid),
    );
    await this.page.waitForResponse(API_ENDPOINTS.storageClasses(TEST_DATA.providers.target.uid));
  }
}
