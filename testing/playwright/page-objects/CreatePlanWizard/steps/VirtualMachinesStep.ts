import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../../fixtures/test-data';
import { Table } from '../../common/Table';

export class VirtualMachinesStep {
  private readonly page: Page;
  private readonly table: Table;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(this.page, this.page.getByTestId('create-plan-vm-step'));
  }

  async fillAndComplete(
    virtualMachines?: { sourceName: string; targetName?: string }[],
  ): Promise<void> {
    await this.verifyStepVisible();
    await this.verifyTableLoaded();

    if (virtualMachines === undefined) {
      await this.selectFirstVirtualMachine();
    } else {
      for (const vm of virtualMachines) {
        await this.searchAndSelectVirtualMachine(vm.sourceName);
      }
    }
  }

  async search(value: string) {
    await this.table.search(value);
  }

  async searchAndSelectVirtualMachine(vmName: string) {
    await this.table.search(vmName);

    // Expand the VM folder if it exists
    const folderRow = this.page.getByTestId('folder-vm');
    const expandButton = folderRow.getByRole('button', { name: /Expand row/ });

    if (await expandButton.isVisible()) {
      const isExpanded = await expandButton.getAttribute('aria-expanded');
      if (isExpanded === 'false') {
        await expandButton.click();
      }
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

  async selectVirtualMachine(vmName: string) {
    await this.table.selectRow({ Name: vmName });
  }

  async verifyStepVisible() {
    await expect(this.page.getByTestId('create-plan-vm-step')).toBeVisible();
  }

  async verifyTableLoaded() {
    await expect(this.page.getByRole('treegrid')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(
      API_ENDPOINTS.virtualMachines('vsphere', TEST_DATA.providers.source.uid),
    );
    await this.page.waitForResponse(API_ENDPOINTS.storageClasses(TEST_DATA.providers.target.uid));
  }
}
