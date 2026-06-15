import { expect, type Locator, type Page } from '@playwright/test';

type ConcernCategory = 'critical' | 'warning' | 'information';

export class ConcernsHelpers {
  private readonly vmTable: Locator;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.vmTable = page.getByRole('grid', { name: 'Virtual machines' });
  }

  async closeConcernPopover(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByTestId('concerns-popover')).not.toBeVisible();
  }

  getConcernBadge(category: ConcernCategory): Locator {
    return this.vmTable.getByTestId(`concern-badge-${category}`).first();
  }

  async openConcernPopover(category?: ConcernCategory): Promise<boolean> {
    const popover = this.page.getByTestId('concerns-popover');
    if (category) {
      const badge = this.getConcernBadge(category);
      if (!(await badge.isVisible().catch(() => false))) {
        return false;
      }
      await badge.click();
    } else {
      let clicked = false;
      for (const cat of ['critical', 'warning', 'information'] as const) {
        const badge = this.getConcernBadge(cat);
        if (await badge.isVisible().catch(() => false)) {
          await badge.click();
          clicked = true;
          break;
        }
      }
      if (!clicked) return false;
    }
    await expect(popover).toBeVisible();
    return true;
  }

  async verifyConcernBadgeExists(
    category: ConcernCategory,
    rowIndex?: number,
    timeout = 60000,
  ): Promise<void> {
    if (rowIndex === undefined) {
      await expect(this.vmTable.getByTestId(`concern-badge-${category}`).first()).toBeVisible({
        timeout,
      });
    } else {
      const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
      const row = bodyRowgroup.getByRole('row').nth(rowIndex);
      await expect(row.getByTestId(`concern-badge-${category}`)).toBeVisible({ timeout });
    }
  }

  async verifyConcernPopoverContent(options?: {
    headerContains?: string;
    minItems?: number;
  }): Promise<void> {
    const popover = this.page.getByTestId('concerns-popover');
    await expect(popover.getByText(/Total:/i)).toBeVisible();
    if (options?.headerContains) {
      await expect(popover.getByRole('heading')).toContainText(options.headerContains);
    }
    if (options?.minItems !== undefined) {
      const count = await popover.locator('[class*="popover__body"] > div').count();
      expect(count).toBeGreaterThanOrEqual(options.minItems);
    }
  }

  async verifyConcernsColumnVisible(): Promise<void> {
    await expect(this.page.getByTestId('concerns-column-header')).toBeVisible();
  }

  async verifyExpandedRowHasConcernDetails(): Promise<void> {
    // PatternFly v6 compact nested tables do not expose <Th> as columnheader in the
    // accessibility tree when rendered inside an expandable row — use th element locator.
    // Scope to the last row in vmTable that contains a <th> (the expanded details row)
    // so assertions cannot spuriously match headers from other tables on the page.
    // Column names in the expanded concerns table: Label, Category, Assessment.
    const expandedRow = this.vmTable
      .getByRole('row')
      .filter({ has: this.page.locator('th') })
      .last();
    for (const col of ['Label', 'Category', 'Assessment']) {
      await expect(expandedRow.locator('th', { hasText: col })).toBeVisible();
    }
  }

  async verifyExpandedRowIsCollapsed(): Promise<void> {
    await expect(this.vmTable.locator('th', { hasText: 'Label' })).not.toBeVisible();
  }

  async verifyFilteredRowsHaveBadge(category: ConcernCategory, timeout = 60000): Promise<void> {
    const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
    const rows = bodyRowgroup.getByRole('row');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i += 1) {
      await expect(rows.nth(i).getByTestId(`concern-badge-${category}`)).toBeVisible({ timeout });
    }
  }
}
