import { expect, type Locator, type Page } from '@playwright/test';

import { Table } from './Table';

/**
 * Shared component for VM tables in Provider Details, Plan Wizard, and Plan Details pages.
 */
export class VirtualMachinesTable {
  protected readonly page: Page;
  protected readonly rootLocator: Locator;
  protected readonly table: Table;

  constructor(page: Page, rootLocator: Locator) {
    this.page = page;
    this.rootLocator = rootLocator;
    this.table = new Table(page, rootLocator);
  }

  async addColumn(columnName: string): Promise<void> {
    const manageColumnsBtn = this.page.getByTestId('manage-columns-button');
    await manageColumnsBtn.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    const checkbox = modalBody.getByRole('checkbox', { name: columnName });
    if ((await checkbox.count()) > 0 && !(await checkbox.isChecked())) {
      await checkbox.check();
      await this.page.waitForTimeout(300);
      await expect(checkbox).toBeChecked();
    }

    const saveBtn = this.page.getByTestId('manage-columns-save-button');
    await saveBtn.click();
    await expect(modalBody).not.toBeVisible();
    await this.page.waitForTimeout(500);
  }

  async clearAllFilters(): Promise<void> {
    await this.table.clearAllFilters();
  }

  async collapseFolder(folder: string): Promise<void> {
    const folderRow = this.page.getByTestId(`folder-${folder}`);

    if (!(await folderRow.isVisible().catch(() => false))) {
      return;
    }

    const collapseButton = folderRow.getByRole('button', { name: /Collapse row/ });
    if (await collapseButton.isVisible().catch(() => false)) {
      const isExpanded = await collapseButton.getAttribute('aria-expanded');
      if (isExpanded === 'true') {
        await collapseButton.click();
      }
    }
  }

  async disableColumn(columnName: string): Promise<void> {
    await this.table.disableColumn(columnName);
  }

  async enableColumn(columnName: string): Promise<void> {
    await this.table.enableColumn(columnName);
  }

  async expandFolder(folder: string): Promise<void> {
    const expandCell = this.page.getByTestId(`folder-${folder}-expand-cell`);

    if (!(await expandCell.isVisible().catch(() => false))) {
      return;
    }

    const expandButton = expandCell.getByRole('button');
    if (await expandButton.isVisible().catch(() => false)) {
      const isExpanded = await expandButton.getAttribute('aria-expanded');
      if (isExpanded === 'false') {
        await expandButton.click();
      }
    }
  }

  async getColumns(): Promise<string[]> {
    return this.table.getColumns();
  }

  async getFirstVMName(): Promise<string> {
    await this.page.getByTestId('vsphere-tree-table').waitFor({ state: 'visible' });

    const firstVMButton = this.page
      .getByTestId('vsphere-tree-table')
      .getByRole('button', { name: /^Expand row [1-9]/ })
      .first();

    const gridcell = firstVMButton.locator('xpath=../..');
    const cellText = await gridcell.textContent();
    return cellText?.trim() ?? '';
  }

  async getFolderVMCount(folderName: string): Promise<number> {
    const vmCountLabel = this.page.getByTestId(`folder-${folderName}-vm-count`);

    if (!(await vmCountLabel.isVisible().catch(() => false))) {
      return 0;
    }

    const labelText = await vmCountLabel.textContent();
    if (!labelText) {
      return 0;
    }

    const count = Number.parseInt(labelText.trim(), 10);
    return Number.isNaN(count) ? 0 : count;
  }

  async isColumnVisible(columnName: string): Promise<boolean> {
    return this.table.isColumnVisible(columnName);
  }

  async removeColumn(columnName: string): Promise<void> {
    const manageColumnsBtn = this.page.getByTestId('manage-columns-button');
    await manageColumnsBtn.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    const checkbox = modalBody.getByRole('checkbox', { name: columnName });
    if ((await checkbox.count()) > 0 && (await checkbox.isChecked())) {
      await checkbox.uncheck();
      await this.page.waitForTimeout(300);
      await expect(checkbox).not.toBeChecked();
    }

    const saveBtn = this.page.getByTestId('manage-columns-save-button');
    await saveBtn.click();
    await expect(modalBody).not.toBeVisible();
    await this.page.waitForTimeout(500);
  }

  async reorderColumn(sourceColumn: string, targetColumn: string): Promise<void> {
    const manageColumnsBtn = this.page.getByTestId('manage-columns-button');
    await manageColumnsBtn.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    const columnList = modalBody.getByTestId('manage-columns-list');
    const sourceItem = columnList.locator(`#${sourceColumn.toLowerCase()}`);
    const targetItem = columnList.locator(`#${targetColumn.toLowerCase()}`);

    if ((await sourceItem.count()) > 0 && (await targetItem.count()) > 0) {
      const sourceDragHandle = sourceItem.getByRole('button').first();
      const targetDragHandle = targetItem.getByRole('button').first();

      const sourceBox = await sourceDragHandle.boundingBox();
      const targetBox = await targetDragHandle.boundingBox();

      if (sourceBox && targetBox) {
        await this.page.mouse.move(
          sourceBox.x + sourceBox.width / 2,
          sourceBox.y + sourceBox.height / 2,
        );
        await this.page.mouse.down();
        await this.page.waitForTimeout(100);

        await this.page.mouse.move(
          targetBox.x + targetBox.width / 2,
          targetBox.y + targetBox.height / 2,
          { steps: 10 },
        );
        await this.page.waitForTimeout(100);

        await this.page.mouse.up();
        await this.page.waitForTimeout(500);
      }
    }

    const saveBtn = this.page.getByTestId('manage-columns-save-button');
    await saveBtn.click();
    await expect(modalBody).not.toBeVisible();
    await this.page.waitForTimeout(500);
  }

  async search(value: string): Promise<void> {
    await this.table.search(value);
  }

  async sortByColumn(columnName: string): Promise<void> {
    const columnHeader = this.page
      .getByTestId('vsphere-tree-table')
      .getByRole('button', { name: columnName });
    await columnHeader.click();
    await this.page.waitForTimeout(500);
  }

  async testConcernButton(): Promise<boolean> {
    const concernButton = this.page.locator('button').filter({ hasText: /^\d+$/ }).first();

    if (!(await concernButton.isVisible())) {
      return false;
    }

    await concernButton.click();
    await this.page.waitForTimeout(500);

    const concernsPopover = this.page.getByTestId('concerns-popover');
    await expect(concernsPopover).toBeVisible();

    await this.page.keyboard.press('Escape');
    await expect(concernsPopover).not.toBeVisible();

    return true;
  }

  async testConcernTypeFilter(): Promise<boolean> {
    const showFiltersButton = this.page.getByRole('button', { name: /Show Filters/i });
    if (!(await showFiltersButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      return false;
    }
    await showFiltersButton.click();
    await this.page.waitForTimeout(300);

    const filterDropdown = this.page.getByRole('button', { name: /Filter by/i }).first();
    if (!(await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false))) {
      return false;
    }
    await filterDropdown.click();

    const concernsTypeOption = this.page.getByRole('option', { name: /Concerns.*type/i });
    if (!(await concernsTypeOption.isVisible({ timeout: 3000 }).catch(() => false))) {
      await this.page.keyboard.press('Escape');
      return false;
    }
    await concernsTypeOption.click();
    await this.page.waitForTimeout(300);

    const filterInput = this.page
      .getByRole('button', { name: /Filter by Concerns/i })
      .or(this.page.getByPlaceholder(/Filter by/i));
    if (!(await filterInput.isVisible({ timeout: 3000 }).catch(() => false))) {
      return false;
    }
    await filterInput.click();
    await this.page.waitForTimeout(300);

    const filterOptions = this.page.locator('[role="option"], .pf-v5-c-menu__list-item');
    const optionCount = await filterOptions.count();
    if (optionCount === 0) {
      await this.page.keyboard.press('Escape');
      return false;
    }

    await filterOptions.first().click();
    await this.page.waitForTimeout(500);

    await this.clearAllFilters();

    return true;
  }

  async testFolderExpandCollapse(): Promise<void> {
    const tableGrid = this.page.locator('[role="treegrid"]').first();
    await expect(tableGrid).toBeVisible();

    const folderRows = await this.page.getByTestId(/^folder-/).count();
    if (folderRows > 0) {
      const firstFolderLocator = this.page.getByTestId(/^folder-/).first();
      const firstFolderTestId = await firstFolderLocator.getAttribute('data-testid');

      if (firstFolderTestId) {
        const toggleButton = firstFolderLocator.locator('button').first();
        const isToggleVisible = await toggleButton.isVisible().catch(() => false);

        if (isToggleVisible) {
          const initialState = await toggleButton.getAttribute('aria-expanded');

          if (initialState === 'false') {
            await toggleButton.click();
            await this.page.waitForTimeout(500);

            const buttonAfterExpand = firstFolderLocator.locator('button').first();
            const expandedState = await buttonAfterExpand.getAttribute('aria-expanded');
            expect(expandedState).toBe('true');

            await buttonAfterExpand.click();
            await this.page.waitForTimeout(500);

            const buttonAfterCollapse = firstFolderLocator.locator('button').first();
            const collapsedState = await buttonAfterCollapse.getAttribute('aria-expanded');
            expect(collapsedState).toBe('false');
          }
        }
      }
    }
  }

  async verifyRowIsVisible(options: Record<string, string>): Promise<void> {
    await this.table.verifyRowIsVisible(options);
  }

  async verifyTableLoaded(): Promise<void> {
    const grid = this.page.getByRole('grid');
    const treegrid = this.page.getByRole('treegrid');
    await expect(grid.or(treegrid)).toBeVisible({ timeout: 30000 });
    await this.table.waitForTableLoad();
  }

  async verifyVMExists(vmName: string): Promise<void> {
    await this.table.verifyRowIsVisible({ Name: vmName });
  }

  async verifyVMsExist(vmNames: string[]): Promise<void> {
    for (const vmName of vmNames) {
      await this.verifyVMExists(vmName);
    }
  }
}
