import { expect, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';
import { Table } from '../../common/Table';

/**
 * Page object for the Add Virtual Machines modal.
 * Extends BaseModal and composes with Table for VM selection functionality.
 */
export class AddVirtualMachinesModal extends BaseModal {
  readonly table: Table;

  constructor(page: Page) {
    super(page, page.getByRole('dialog'));
    this.table = new Table(page, this.modal);
  }

  async getRowCount(): Promise<number> {
    return this.table.getRowCount();
  }

  async search(vmName: string): Promise<void> {
    await this.table.search(vmName);
  }

  async selectVirtualMachine(vmName: string): Promise<void> {
    await this.table.selectRow({ Name: vmName });
  }

  async verifyModalTitle(): Promise<void> {
    await expect(this.modal).toContainText('Add virtual machines to migration plan');
  }

  async verifyVmInTable(vmName: string): Promise<void> {
    await this.table.verifyRowIsVisible({ Name: vmName });
  }

  async verifyVmNotInTable(vmName: string): Promise<void> {
    const row = this.table.getRow({ Name: vmName });
    await expect(row).not.toBeVisible();
  }
}
