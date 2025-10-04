import { expect, type Locator, type Page } from '@playwright/test';

export class Table {
  private readonly page: Page;
  private readonly rootLocator: Locator;

  constructor(page: Page, rootLocator: Locator) {
    this.page = page;
    this.rootLocator = rootLocator;
  }

  async changeFilter(filterName: string): Promise<void> {
    const filterSelect = this.rootLocator
      .getByTestId('table-filter-select')
      .or(this.rootLocator.getByRole('button').filter({ hasText: /^(?:Name|Concerns|Host)$/ }));

    await filterSelect.click();
    await this.page.getByRole('menuitem', { name: filterName, exact: true }).click();
  }

  async clearAllFilters(): Promise<void> {
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

  async enableColumn(columnName: string): Promise<void> {
    const currentColumns = await this.getColumns();
    if (currentColumns.includes(columnName)) {
      return;
    }

    const manageColumnsButton = this.rootLocator.getByRole('button', { name: 'Manage columns' });
    await manageColumnsButton.click();

    const modal = this.page.getByRole('dialog', { name: 'Manage columns' });
    await expect(modal).toBeVisible();

    const columnList = modal.getByRole('list', { name: 'Manage columns' });
    const targetListItem = columnList
      .getByRole('listitem')
      .filter({ hasText: new RegExp(`^${columnName}$`) });

    if ((await targetListItem.count()) === 0) {
      const cancelButton = modal.getByRole('button', { name: 'Cancel' });
      await cancelButton.click();
      await expect(modal).not.toBeVisible();
      throw new Error(`Column "${columnName}" not found in available columns`);
    }

    const checkbox = targetListItem.getByRole('checkbox');
    if ((await checkbox.count()) > 0) {
      const isChecked = await checkbox.isChecked();
      const isDisabled = await checkbox.isDisabled();

      if (!isDisabled && !isChecked) {
        await checkbox.check();
      }
    }

    const saveButton = modal.getByRole('button', { name: 'Save' });
    await saveButton.click();

    await expect(modal).not.toBeVisible();
  }

  async getColumns(): Promise<string[]> {
    const tableContainer = this.rootLocator
      .getByTestId('table-grid')
      .or(this.rootLocator.getByRole('table'))
      .or(this.rootLocator.getByRole('grid'));

    const headers = tableContainer.locator('thead th, thead columnheader');
    const count = await headers.count();

    const headerTexts = await Promise.all(
      Array.from({ length: count }, async (_, i) => headers.nth(i).textContent()),
    );

    return headerTexts
      .filter((text) => text?.trim() && !text.includes('Row select') && !text.includes('Details'))
      .map((text) => text!.replaceAll(/\s+/g, ' ').trim())
      .filter((cleanText) => cleanText && cleanText !== 'More information on concerns');
  }

  getRow(options: Record<string, string>): Locator {
    const tableContainer = this.rootLocator
      .getByTestId('table-grid')
      .or(this.rootLocator.getByRole('table'))
      .or(this.rootLocator.getByRole('grid'))
      .or(this.rootLocator.getByRole('treegrid'));

    let rows = tableContainer.locator('tbody tr');

    for (const [_columnName, expectedValue] of Object.entries(options)) {
      rows = rows.filter({ hasText: expectedValue });
    }

    return rows.first();
  }

  getRowByTestId(testId: string): Locator {
    return this.rootLocator.getByTestId(testId);
  }

  async isColumnVisible(columnName: string): Promise<boolean> {
    const currentColumns = await this.getColumns();
    return currentColumns.includes(columnName);
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

  async verifyRowIsVisible(options: Record<string, string>): Promise<void> {
    const row = this.getRow(options);
    await expect(row).toBeVisible();
  }

  async waitForTableLoad(): Promise<void> {
    const tableContainer = this.rootLocator
      .getByTestId('table-grid')
      .or(this.rootLocator.getByRole('table'))
      .or(this.rootLocator.getByRole('grid'));
    await expect(tableContainer).toBeVisible();

    await expect(
      tableContainer
        .locator('tbody tr')
        .first()
        .or(this.rootLocator.getByText('No results found'))
        .or(this.rootLocator.getByText(/No .* found/)),
    ).toBeVisible();
  }
}
