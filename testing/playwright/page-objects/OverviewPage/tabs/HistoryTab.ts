import { expect, type Locator, type Page } from '@playwright/test';

import { prepareConsolePage } from '../../../utils/utils';

export class HistoryTab {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get averageRateCard(): Locator {
    return this.page.getByTestId('migration-summary-rate');
  }

  cell(migrationUid: string, field: 'data' | 'duration' | 'rate' | 'status'): Locator {
    return this.page.getByTestId(`migration-row-${migrationUid}-${field}`);
  }

  get dataCard(): Locator {
    return this.page.getByTestId('migration-summary-data');
  }

  async filterByStatus(label: string): Promise<void> {
    await this.page.getByTestId('filter-toggle-vms').click();
    await this.page.getByTestId(`filter-value-${label}`).click();
  }

  get medianCard(): Locator {
    return this.page.getByTestId('migration-summary-median');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/mtv/overview/history');
    await this.page.waitForLoadState('domcontentloaded');
    await prepareConsolePage(this.page);
    await expect(this.table).toBeVisible();
  }

  row(migrationUid: string): Locator {
    return this.page.getByTestId(`migration-row-${migrationUid}`);
  }

  get runsCard(): Locator {
    return this.page.getByTestId('migration-summary-runs');
  }

  get table(): Locator {
    return this.page.getByTestId('migrations-list');
  }
}
