import { expect, type Locator, type Page } from '@playwright/test';

import { RESOURCES_HEADING_TIMEOUT_MS } from '../../../utils/timeouts';
import { V5_0_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';

export class ResourcesTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get heading(): Locator {
    return isVersionAtLeast(V5_0_0)
      ? this.page.getByTestId('plan-resources-heading')
      : this.page.getByRole('heading', { level: 2, name: 'Resources' });
  }

  async navigateToResourcesTab(): Promise<void> {
    await this.tab.waitFor({ state: 'visible' });
    await this.tab.click();
    await expect(this.heading).toBeVisible({ timeout: RESOURCES_HEADING_TIMEOUT_MS });
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
    return isVersionAtLeast(V5_0_0)
      ? this.page.getByTestId('plan-resources-table')
      : this.page.getByRole('grid');
  }

  async verifyAggregateCells(): Promise<void> {
    if (isVersionAtLeast(V5_0_0)) {
      for (const testId of [
        'resources-vms-total',
        'resources-cpu-total',
        'resources-memory-total',
      ]) {
        await expect(this.page.getByTestId(testId)).toContainText(/\d/);
      }
      for (const testId of [
        'resources-vms-running',
        'resources-cpu-running',
        'resources-memory-running',
      ]) {
        await expect(this.page.getByTestId(testId)).toContainText(/\d|-/);
      }
    } else {
      await expect(this.rowVirtualMachines).toContainText(/\d/);
      await expect(this.rowTotalCpuCount).toContainText(/\d/);
      await expect(this.rowTotalMemory).toContainText(/\d/);
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
