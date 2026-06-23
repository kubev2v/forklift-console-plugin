import { expect, type Page } from '@playwright/test';

export class ResourcesTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get columnHeaderResource() {
    return this.page.getByRole('columnheader', { name: 'Resource' });
  }

  get columnHeaderRunningVMs() {
    return this.page.getByRole('columnheader', { name: 'Running virtual machines' });
  }

  get columnHeaderTotalVMs() {
    return this.page.getByRole('columnheader', { name: 'Total virtual machines' });
  }

  get heading() {
    return this.page.getByTestId('plan-resources-heading');
  }

  async navigateToResourcesTab(): Promise<void> {
    await this.tab.click();
    await expect(this.heading).toBeVisible();
  }

  get rowTotalCpuCount() {
    return this.table.getByRole('row', { name: /Total CPU count/ });
  }

  get rowTotalMemory() {
    return this.table.getByRole('row', { name: /Total memory/ });
  }

  get rowVirtualMachines() {
    return this.table.getByRole('row', { name: /Virtual machines/ });
  }

  get tab() {
    return this.page.locator('[data-test-id="horizontal-link-Resources"]');
  }

  get table() {
    return this.page.getByTestId('plan-resources-table');
  }

  async verifyResourceRows(): Promise<void> {
    await expect(this.rowVirtualMachines).toBeVisible();
    await expect(this.rowTotalCpuCount).toBeVisible();
    await expect(this.rowTotalMemory).toBeVisible();
  }

  async verifyResourcesTabSelected(): Promise<void> {
    await expect(this.tab).toHaveAttribute('aria-selected', 'true');
    await expect(this.page).toHaveURL(/\/resources/);
  }

  async verifyTableHeaders(): Promise<void> {
    await expect(this.columnHeaderResource).toBeVisible();
    await expect(this.columnHeaderTotalVMs).toBeVisible();
    await expect(this.columnHeaderRunningVMs).toBeVisible();
  }

  async verifyTableStructure(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.table).toBeVisible();
    await this.verifyTableHeaders();
    await this.verifyResourceRows();
  }
}
