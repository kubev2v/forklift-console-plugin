import type { Page } from '@playwright/test';

import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';

export class VirtualMachinesTab extends VirtualMachinesTable {
  constructor(page: Page) {
    super(page, page.locator('main'));
  }

  async getTableCell(rowColumnName: string, rowValue: string, targetColumnName: string) {
    return this.table.getCell(rowColumnName, rowValue, targetColumnName);
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

  async waitForTableLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
