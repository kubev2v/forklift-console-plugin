import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../../fixtures/test-data';

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
      API_ENDPOINTS.virtualMachines('vsphere', TEST_DATA.providers.source.uid),
    );
    await this.page.waitForResponse(API_ENDPOINTS.storageClasses(TEST_DATA.providers.target.uid));
  }
}
