import type { Page } from '@playwright/test';

import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';

export class VirtualMachinesTab extends VirtualMachinesTable {
  constructor(page: Page) {
    super(page, page.locator('main'));
  }

  async getTableCell(rowColumnName: string, rowValue: string, targetColumnName: string) {
    const vmRow = this.table.getRow({ [rowColumnName]: rowValue });

    // Get table headers to find the column index
    const tableContainer = this.page.locator('[role="treegrid"]');
    const headers = await tableContainer
      .locator('thead th, thead [role="columnheader"]')
      .allTextContents();

    const targetIndex = headers.findIndex((header) => header?.trim() === targetColumnName);
    if (targetIndex === -1) {
      throw new Error(`Column "${targetColumnName}" not found`);
    }

    return vmRow.locator(`td:nth-child(${targetIndex + 1})`);
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    const virtualMachinesTab = this.page.locator(
      '[data-test-id="horizontal-link-Virtual machines"]',
    );
    await virtualMachinesTab.click();
    await this.page.waitForURL((url) => url.toString().endsWith('/vms'));
  }

  async selectVirtualMachine(vmName: string): Promise<void> {
    await this.table.selectRow({ Name: vmName });
  }
}
