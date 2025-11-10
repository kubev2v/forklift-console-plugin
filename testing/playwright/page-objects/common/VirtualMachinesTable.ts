import { expect, type Locator, type Page } from '@playwright/test';

import { Table } from './Table';

/**
 * Shared component for VM tables that appear in:
 * - Provider Details Page > Virtual Machines tab
 * - Plan Creation Wizard > Virtual Machines step
 * - Plan Details Page > Virtual Machines tab (similar but with differences)
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

  /**
   * Adds a column by checking it in the Manage columns modal
   */
  async addColumn(columnName: string): Promise<void> {
    const manageColumnsBtn = this.page.getByTestId('manage-columns-button');
    await manageColumnsBtn.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    // Add column
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

  /**
   * Expand a folder in the virtual machines tree table.
   * Uses data-testid selectors for reliability.
   *
   * @param folder - Name of the folder to expand
   */
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

  /**
   * Gets the first visible VM name from the table
   * @returns The name of the first VM in the table
   */
  async getFirstVMName(): Promise<string> {
    // Wait for table to be visible
    await this.page.getByTestId('vsphere-tree-table').waitFor({ state: 'visible' });

    // Find the first VM row button using aria-label (row 0 is folder, rows 1+ are VMs)
    const firstVMButton = this.page
      .getByTestId('vsphere-tree-table')
      .getByRole('button', { name: /^Expand row [1-9]/ })
      .first();

    // Get the parent gridcell's text content
    const gridcell = firstVMButton.locator('xpath=../..'); // Navigate up two levels to gridcell
    const cellText = await gridcell.textContent();

    // The VM name is in the cell text
    const vmName = cellText?.trim() ?? '';
    return vmName;
  }

  /**
   * Gets the count of VMs in a folder from the folder row text
   * @param folderName - Name of the folder
   * @returns Number of VMs in the folder, or 0 if not found
   */
  async getFolderVMCount(folderName: string): Promise<number> {
    const vmCountLabel = this.page.getByTestId(`folder-${folderName}-vm-count`);

    if (!(await vmCountLabel.isVisible().catch(() => false))) {
      return 0;
    }

    // Get the text content directly from the label (e.g., "25 VMs")
    const labelText = await vmCountLabel.textContent();
    if (!labelText) {
      return 0;
    }

    // Extract just the number from the beginning of the text
    const count = parseInt(labelText.trim(), 10);
    return isNaN(count) ? 0 : count;
  }

  async isColumnVisible(columnName: string): Promise<boolean> {
    return this.table.isColumnVisible(columnName);
  }

  /**
   * Removes a column by unchecking it in the Manage columns modal
   */
  async removeColumn(columnName: string): Promise<void> {
    const manageColumnsBtn = this.page.getByTestId('manage-columns-button');
    await manageColumnsBtn.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    // Remove column
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

  /**
   * Reorders columns using drag and drop with mouse API
   * @param sourceColumn - Column to move
   * @param targetColumn - Column to move before/after
   */
  async reorderColumn(sourceColumn: string, targetColumn: string): Promise<void> {
    // Open Manage columns modal
    const manageColumnsBtn = this.page.getByTestId('manage-columns-button');
    await manageColumnsBtn.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    const columnList = modalBody.getByTestId('manage-columns-list');

    // Find list items and their draggable buttons
    const sourceListItem = columnList
      .getByRole('listitem')
      .filter({ hasText: new RegExp(`^${sourceColumn}$`) });
    const targetListItem = columnList
      .getByRole('listitem')
      .filter({ hasText: new RegExp(`^${targetColumn}$`) });

    if ((await sourceListItem.count()) > 0 && (await targetListItem.count()) > 0) {
      // Get draggable buttons (named with column name)
      const sourceDragHandle = sourceListItem.getByRole('button', { name: sourceColumn });
      const targetDragHandle = targetListItem.getByRole('button', { name: targetColumn });

      // Use mouse API for proper drag and drop
      const sourceBox = await sourceDragHandle.boundingBox();
      const targetBox = await targetDragHandle.boundingBox();

      if (sourceBox && targetBox) {
        // Move to source and press mouse
        await this.page.mouse.move(
          sourceBox.x + sourceBox.width / 2,
          sourceBox.y + sourceBox.height / 2,
        );
        await this.page.mouse.down();
        await this.page.waitForTimeout(100);

        // Move to target with smooth animation
        await this.page.mouse.move(
          targetBox.x + targetBox.width / 2,
          targetBox.y + targetBox.height / 2,
          {
            steps: 10,
          },
        );
        await this.page.waitForTimeout(100);

        // Release mouse
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

  /**
   * Clicks a column header to sort by that column
   * @param columnName - Name of the column to sort by
   */
  async sortByColumn(columnName: string): Promise<void> {
    const columnHeader = this.page
      .getByTestId('vsphere-tree-table')
      .getByRole('button', { name: columnName });
    await columnHeader.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Tests concern button functionality by clicking the first concern button
   * and verifying the popover opens and can be closed
   * @returns true if a concern button was found and tested, false otherwise
   */
  async testConcernButton(): Promise<boolean> {
    // Find a VM with concerns (has concern buttons visible)
    const concernButton = this.page.locator('button').filter({ hasText: /^\d+$/ }).first();

    if (!(await concernButton.isVisible())) {
      return false;
    }

    const concernCount = await concernButton.textContent();
    console.log('Clicking concern button with count:', concernCount);

    // Click the concern button to open popover
    await concernButton.click();
    await this.page.waitForTimeout(500);

    // Verify concerns popover is visible
    const concernsPopover = this.page.getByTestId('concerns-popover');
    await expect(concernsPopover).toBeVisible();

    // Close the popover by pressing Escape
    await this.page.keyboard.press('Escape');
    await expect(concernsPopover).not.toBeVisible();

    return true;
  }

  /**
   * Tests folder expand/collapse functionality
   * Finds first folder, expands if collapsed, then collapses it back
   */
  async testFolderExpandCollapse(): Promise<void> {
    const tableGrid = this.page.locator('[role="treegrid"]').first();
    await expect(tableGrid).toBeVisible();

    // Get first folder row if it exists
    const folderRows = await this.page.getByTestId(/^folder-/).count();
    if (folderRows > 0) {
      const firstFolderLocator = this.page.getByTestId(/^folder-/).first();
      const firstFolderTestId = await firstFolderLocator.getAttribute('data-testid');

      if (firstFolderTestId) {
        // Find toggle button (works for both Expand and Collapse states)
        const toggleButton = firstFolderLocator.locator('button').first();
        const isToggleVisible = await toggleButton.isVisible().catch(() => false);

        if (isToggleVisible) {
          const initialState = await toggleButton.getAttribute('aria-expanded');

          // If collapsed, expand it
          if (initialState === 'false') {
            await toggleButton.click();
            await this.page.waitForTimeout(500);

            // Re-query the button to get updated state
            const buttonAfterExpand = firstFolderLocator.locator('button').first();
            const expandedState = await buttonAfterExpand.getAttribute('aria-expanded');
            expect(expandedState).toBe('true');

            // Collapse it back
            await buttonAfterExpand.click();
            await this.page.waitForTimeout(500);

            // Re-query again to verify collapse
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
    await expect(this.page.getByRole('treegrid')).toBeVisible({ timeout: 30000 });
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
