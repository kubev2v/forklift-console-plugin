import { expect, type Locator, type Page } from '@playwright/test';

export class ResourcesTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading(): Locator {
    return this.page.getByTestId('plan-resources-heading');
  }

  async navigateToResourcesTab(): Promise<void> {
    await this.tab.waitFor({ state: 'visible' });
    await this.tab.click();
    // The provider watch + inventory REST call are sequential: provider must load before
    // inventory starts. On slow clusters the full chain can exceed the default 15 s timeout.
    await expect(this.heading).toBeVisible({ timeout: 30000 });
  }

  get rowTotalCpuCount(): Locator {
    return this.table.locator('tbody').getByRole('row', { name: /Total CPU count/ });
  }

  get rowTotalMemory(): Locator {
    return this.table.locator('tbody').getByRole('row', { name: /Total memory/ });
  }

  get rowVirtualMachines(): Locator {
    return this.table.locator('tbody').getByRole('row', { name: /Virtual machines/ });
  }

  get tab(): Locator {
    return this.page.getByRole('tab', { exact: true, name: 'Resources' });
  }

  get table(): Locator {
    return this.page.getByTestId('plan-resources-table');
  }

  async verifyAggregateCells(): Promise<void> {
    for (const testId of ['resources-vms-total', 'resources-cpu-total', 'resources-memory-total']) {
      await expect(this.page.getByTestId(testId)).toContainText(/\d/);
    }
    for (const testId of [
      'resources-vms-running',
      'resources-cpu-running',
      'resources-memory-running',
    ]) {
      await expect(this.page.getByTestId(testId)).toContainText(/\d|-/);
    }
  }

  async verifyResourcesTabSelected(): Promise<void> {
    await expect(this.tab).toHaveAttribute('aria-selected', 'true');
    await expect(this.page).toHaveURL(/\/resources(?:\?|$)/);
  }

  async verifyTableStructure(): Promise<void> {
    await expect(this.table).toBeVisible();
    await expect(this.table.getByRole('columnheader', { name: 'Resource' })).toBeVisible();
    await expect(
      this.table.getByRole('columnheader', { name: 'Total virtual machines' }),
    ).toBeVisible();
    await expect(
      this.table.getByRole('columnheader', { name: 'Running virtual machines' }),
    ).toBeVisible();
    await expect(this.rowVirtualMachines).toBeVisible();
    await expect(this.rowTotalCpuCount).toBeVisible();
    await expect(this.rowTotalMemory).toBeVisible();
  }
}
