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

  getRow(options: Record<string, string>): Locator {
    // Try table/grid/treegrid roles to support different table implementations
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
    // Wait for table to be visible and not show loading state - support both table and grid
    const tableContainer = this.rootLocator
      .getByTestId('table-grid')
      .or(this.rootLocator.getByRole('table'))
      .or(this.rootLocator.getByRole('grid'));
    await expect(tableContainer).toBeVisible();

    // Wait for at least one row or empty state - support tbody tr structure
    await expect(
      tableContainer
        .locator('tbody tr')
        .first()
        .or(this.rootLocator.getByText('No results found'))
        .or(this.rootLocator.getByText(/No .* found/)),
    ).toBeVisible();
  }
}
