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

  async getFirstVisibleConcernBadge(): Promise<Locator | null> {
    for (const category of ['critical', 'warning', 'information'] as const) {
      const badge = this.getConcernBadge(category);
      if (await badge.isVisible().catch(() => false)) {
        return badge;
      }
    }
    return null;
  }

  async openConcernPopover(category?: ConcernCategory): Promise<boolean> {
    const badge = category
      ? this.getConcernBadge(category)
      : await this.getFirstVisibleConcernBadge();
    if (!badge || !(await badge.isVisible().catch(() => false))) {
      return false;
    }
    await badge.click();
    const popover = this.page.getByTestId('concerns-popover');
    await expect(popover).toBeVisible();
    return true;
  }

  async verifyConcernBadgeExists(category: ConcernCategory, rowIndex?: number): Promise<void> {
    if (rowIndex === undefined) {
      await expect(this.vmTable.getByTestId(`concern-badge-${category}`).first()).toBeVisible();
    } else {
      const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
      const row = bodyRowgroup.getByRole('row').nth(rowIndex);
      await expect(row.getByTestId(`concern-badge-${category}`)).toBeVisible();
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
    for (const col of ['Label', 'Category', 'Assessment']) {
      await expect(this.page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  }

  async verifyExpandedRowIsCollapsed(): Promise<void> {
    await expect(this.page.getByRole('columnheader', { name: 'Label' })).not.toBeVisible();
  }

  async verifyFilteredRowsHaveBadge(category: ConcernCategory): Promise<void> {
    const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
    const rows = bodyRowgroup.getByRole('row');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i += 1) {
      await expect(rows.nth(i).getByTestId(`concern-badge-${category}`)).toBeVisible();
    }
  }
}
