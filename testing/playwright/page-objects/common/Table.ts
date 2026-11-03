import { expect, type Locator, type Page } from '@playwright/test';

import { K8S_RECONCILE_TIMEOUT } from '../../utils/resource-manager/constants';

export class Table {
  private readonly page: Page;
  private readonly rootLocator: Locator;

  constructor(page: Page, rootLocator: Locator) {
    this.page = page;
    this.rootLocator = rootLocator;
  }

  private getTableContainer(): Locator {
    return this.rootLocator
      .getByTestId('table-grid')
      .or(this.rootLocator.getByRole('table'))
      .or(this.rootLocator.getByRole('grid'))
      .or(this.rootLocator.getByRole('treegrid'));
  }

  async changeFilter(filterName: string): Promise<void> {
    const filterSelect = this.rootLocator
      .getByTestId('table-filter-select')
      .or(this.rootLocator.getByRole('button').filter({ hasText: /^(?:Name|Concerns|Host)$/u }));

    await filterSelect.click();
    await this.page.getByRole('menuitem', { exact: true, name: filterName }).click();
  }

  async clearAllFilters(): Promise<void> {
    // Try to click the clear all filters button
    const clearButton = this.rootLocator
      .getByTestId('clear-all-filters')
      .or(this.page.getByRole('button', { name: 'Clear all filters' }));

    await clearButton.click();
  }

  async clickRow(options: Record<string, string>): Promise<void> {
    const row = this.getRow(options);
    await row.click();
  }

  async clickRowByTestId(testId: string): Promise<void> {
    const row = this.getRowByTestId(testId);
    await row.click();
  }

  async disableColumn(columnName: string): Promise<void> {
    const currentColumns = await this.getColumns();
    if (!currentColumns.includes(columnName)) {
      return;
    }

    const manageColumnsButton = this.rootLocator.getByTestId('manage-columns-button');
    await manageColumnsButton.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    const checkbox = modalBody.getByRole('checkbox', { exact: true, name: columnName });
    if ((await checkbox.count()) === 0) {
      const cancelButton = this.page.getByTestId('manage-columns-cancel-button');
      await cancelButton.click();
      await expect(modalBody).not.toBeVisible();
      throw new Error(`Column "${columnName}" not found in available columns`);
    }

    if (!(await checkbox.isDisabled()) && (await checkbox.isChecked())) {
      await checkbox.uncheck();
    }

    const saveButton = this.page.getByTestId('manage-columns-save-button');
    await saveButton.click();

    await expect(modalBody).not.toBeVisible();
    await this.waitForTableLoad();
    await expect
      .poll(async () => this.isColumnVisible(columnName), { timeout: K8S_RECONCILE_TIMEOUT })
      .toBe(false);
  }

  async enableColumn(columnName: string): Promise<void> {
    const currentColumns = await this.getColumns();
    if (currentColumns.includes(columnName)) {
      return;
    }

    const manageColumnsButton = this.rootLocator.getByTestId('manage-columns-button');
    await manageColumnsButton.click();

    const modalBody = this.page.getByTestId('manage-columns-modal');
    await expect(modalBody).toBeVisible();

    const checkbox = modalBody.getByRole('checkbox', { exact: true, name: columnName });
    if ((await checkbox.count()) === 0) {
      const cancelButton = this.page.getByTestId('manage-columns-cancel-button');
      await cancelButton.click();
      await expect(modalBody).not.toBeVisible();
      throw new Error(`Column "${columnName}" not found in available columns`);
    }

    if (!(await checkbox.isDisabled()) && !(await checkbox.isChecked())) {
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }

    const saveButton = this.page.getByTestId('manage-columns-save-button');
    await saveButton.click();

    await expect(modalBody).not.toBeVisible();
    await this.waitForTableLoad();
    await expect
      .poll(async () => this.isColumnVisible(columnName), { timeout: K8S_RECONCILE_TIMEOUT })
      .toBe(true);
  }

  async getCell(
    rowColumnName: string,
    rowValue: string,
    targetColumnName: string,
  ): Promise<Locator> {
    const row = this.getRow({ [rowColumnName]: rowValue });
    const tableContainer = this.getTableContainer();
    const headers = tableContainer.locator('thead th, thead [role="columnheader"]');
    const headerTexts = await Promise.all(
      (await headers.all()).map(async (header) => {
        const title = header.locator('[data-column-title]');
        return (await title.count()) > 0 ? title.textContent() : header.textContent();
      }),
    );
    // Prefer the visible title: resize controls and help text also contribute to header text.
    const targetIndex = headerTexts.findIndex((header) => {
      const trimmed = header?.trim() ?? '';
      return trimmed === targetColumnName || trimmed.startsWith(`${targetColumnName} `);
    });
    if (targetIndex === -1) {
      throw new Error(`Column "${targetColumnName}" not found`);
    }
    return row.locator(`td:nth-child(${targetIndex + 1})`);
  }

  async getColumns(): Promise<string[]> {
    const tableContainer = this.getTableContainer();
    const titles = tableContainer.locator('thead [data-column-title]');

    if ((await titles.count()) > 0) {
      return (await titles.allTextContents()).map((title) => title.trim()).filter(Boolean);
    }

    const headers = tableContainer.getByRole('columnheader');
    const count = await headers.count();

    const headerTexts = await Promise.all(
      Array.from({ length: count }, (_, i) => headers.nth(i).textContent()),
    );

    return headerTexts
      .filter((text) => text?.trim() && !text.includes('Row select') && !text.includes('Details'))
      .map((text) => (text ?? '').replaceAll(/\s+/gu, ' ').trim())
      .filter((cleanText) => cleanText && cleanText !== 'More information on concerns');
  }

  getRow(options: Record<string, string>): Locator {
    const tableContainer = this.getTableContainer();

    let rows = tableContainer.locator('tbody tr');
    for (const [_columnName, expectedValue] of Object.entries(options)) {
      rows = rows.filter({
        has: this.page.getByText(expectedValue, { exact: true }),
      });
    }

    return rows.first();
  }

  getRowByTestId(testId: string): Locator {
    return this.rootLocator.getByTestId(testId);
  }

  getRowCount(): Promise<number> {
    const tableContainer = this.getTableContainer();
    return tableContainer.locator('tbody tr').count();
  }

  async isColumnVisible(columnName: string): Promise<boolean> {
    const tableContainer = this.getTableContainer();
    const header = tableContainer
      .locator('thead')
      .getByText(columnName, { exact: true })
      .or(tableContainer.getByRole('columnheader', { exact: true, name: columnName }))
      .first();
    return header.isVisible().catch(() => false);
  }

  async search(value: string): Promise<void> {
    const searchInput = this.rootLocator.getByRole('textbox', { name: 'Search input' });

    await searchInput.fill(value);
    await searchInput.press('Enter');
  }

  async selectRow(options: Record<string, string>): Promise<void> {
    const row = this.getRow(options);
    const checkbox = row.getByTestId('row-select-checkbox').or(row.getByRole('checkbox'));
    await checkbox.check();
  }

  async selectRowByTestId(testId: string): Promise<void> {
    const row = this.getRowByTestId(testId);
    const checkbox = row.getByTestId('row-select-checkbox').or(row.getByRole('checkbox'));
    await checkbox.check();
  }

  async verifyResizeHandlesAtHeaderEdges(): Promise<void> {
    const headers = this.getTableContainer().locator('thead th:has([data-resize-handle="true"])');
    const count = await headers.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const header = headers.nth(index);
      const columnId = await header.getAttribute('data-column-id');
      const geometry = await header.evaluate((cell) => {
        const handle = cell.querySelector<HTMLElement>('[data-resize-handle="true"]');
        if (!handle) return null;
        const cellBounds = cell.getBoundingClientRect();
        const handleBounds = handle.getBoundingClientRect();
        const isRtl = getComputedStyle(cell).direction === 'rtl';
        return {
          edgeDistance: isRtl
            ? Math.abs(handleBounds.left - cellBounds.left)
            : Math.abs(handleBounds.right - cellBounds.right),
          handleHeight: handleBounds.height,
          handleWidth: handleBounds.width,
        };
      });

      expect(geometry, `Resize handle geometry for ${columnId ?? index}`).not.toBeNull();
      expect(
        geometry?.edgeDistance,
        `Resize handle edge for ${columnId ?? index}`,
      ).toBeLessThanOrEqual(2);
      expect(geometry?.handleWidth).toBeGreaterThanOrEqual(32);
      expect(geometry?.handleHeight).toBeGreaterThanOrEqual(32);
    }
  }

  async verifyRowIsVisible(options: Record<string, string>): Promise<void> {
    const row = this.getRow(options);
    await expect(row).toBeVisible();
  }

  async waitForColumnVisible(columnName: string): Promise<void> {
    const tableContainer = this.getTableContainer();
    await expect(
      tableContainer
        .locator('thead')
        .getByText(columnName, { exact: true })
        .or(tableContainer.getByRole('columnheader', { exact: true, name: columnName }))
        .first(),
    ).toBeVisible({ timeout: K8S_RECONCILE_TIMEOUT });
  }

  async waitForTableLoad(): Promise<void> {
    const tableContainer = this.getTableContainer();
    await expect(tableContainer).toBeVisible();

    await expect(
      tableContainer
        .locator('tbody tr')
        .first()
        .or(this.rootLocator.getByText('No results found'))
        .or(this.rootLocator.getByText(/No .* found/u))
        .first(),
    ).toBeVisible();
  }
}
