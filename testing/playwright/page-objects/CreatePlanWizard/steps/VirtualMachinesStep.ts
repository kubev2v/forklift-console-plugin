import { expect, type Page } from '@playwright/test';

export class VirtualMachinesStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectFirstVirtualMachine() {
    const grid = this.page.getByRole('grid');
    const firstRow = grid.locator('tbody tr').first();
    const checkbox = firstRow.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async selectVirtualMachine(vmName: string) {
    await this.page.getByTestId(`vm-checkbox-${vmName}`).check();
  }

  async verifyStepVisible() {
    await expect(this.page.getByTestId('create-plan-vm-step')).toBeVisible();
  }

  async verifyTableLoaded() {
    await expect(this.page.getByRole('grid')).toBeVisible();
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(
      '**/forklift-inventory/providers/vsphere/test-source-uid-1/vms?detail=4',
    );
    await this.page.waitForResponse(
      '**/forklift-inventory/providers/openshift/test-target-uid-1/storageclasses?detail=1',
    );
  }
}
