import { expect, type Page } from '@playwright/test';

export class ResourcesTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async verifyResourceRows(): Promise<void> {
    await expect(this.rowVirtualMachines).toBeVisible();
    await expect(this.rowTotalCpuCount).toBeVisible();
    await expect(this.rowTotalMemory).toBeVisible();
  }

  private async verifyTableHeaders(): Promise<void> {
    await expect(this.page.getByRole('columnheader', { name: 'Resource' })).toBeVisible();
    await expect(
      this.page.getByRole('columnheader', { name: 'Total virtual machines' }),
    ).toBeVisible();
    await expect(
      this.page.getByRole('columnheader', { name: 'Running virtual machines' }),
    ).toBeVisible();
  }

  get heading() {
    return this.page.getByTestId('plan-resources-heading');
  }

  async navigateToResourcesTab(): Promise<void> {
    await this.tab.click();
    await expect(this.heading).toBeVisible();
  }

  get rowTotalCpuCount() {
    return this.table.locator('tbody').getByRole('row', { name: /Total CPU count/ });
  }

  get rowTotalMemory() {
    return this.table.locator('tbody').getByRole('row', { name: /Total memory/ });
  }

  get rowVirtualMachines() {
    return this.table.locator('tbody').getByRole('row', { name: /Virtual machines/ });
  }

  get tab() {
    return this.page.locator('[data-test-id="horizontal-link-Resources"]');
  }

  get table() {
    return this.page.getByTestId('plan-resources-table');
  }

  async verifyResourcesTabSelected(): Promise<void> {
    await expect(this.tab).toHaveAttribute('aria-selected', 'true');
    await expect(this.page).toHaveURL(/\/resources/);
  }

  async verifyTableStructure(): Promise<void> {
    await expect(this.table).toBeVisible();
    await this.verifyTableHeaders();
    await this.verifyResourceRows();
  }
}
