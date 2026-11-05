import { expect, type Locator, type Page } from '@playwright/test';

export class MigrationHistorySection {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  cell(migrationUid: string, columnIndex: number): Locator {
    return this.row(migrationUid).locator('td').nth(columnIndex);
  }

  async expand(migrationUid: string): Promise<void> {
    await this.row(migrationUid).getByRole('button').first().click();
    await expect(this.vmBreakdown).toBeVisible();
  }

  async expandSection(): Promise<void> {
    await this.page.getByRole('button', { name: 'Migration history' }).click();
    await expect(this.table).toBeVisible();
  }

  row(migrationUid: string): Locator {
    return this.page.getByTestId(`migration-history-row-${migrationUid}`);
  }

  get table(): Locator {
    return this.page.getByTestId('plan-migration-history');
  }

  get vmBreakdown(): Locator {
    return this.page.getByTestId('migration-history-vm-breakdown');
  }
}
