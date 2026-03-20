import { expect, type Locator, type Page } from '@playwright/test';

const DATA_LOAD_TIMEOUT_MS = 90000;

export class ThroughputCard {
  private readonly card: Locator;
  private readonly page: Page;
  private readonly title: string;

  constructor(page: Page, title: string) {
    this.page = page;
    this.title = title;
    this.card = page
      .locator('.forklift-overview__throughput-card')
      .filter({ has: page.locator('.forklift-title', { hasText: title }) });
  }

  get cardTitle(): Locator {
    return this.card.locator('.forklift-title');
  }

  get planBadge(): Locator {
    return this.planFilterToggle.getByTestId('plan-badge-count');
  }

  get planFilterToggle(): Locator {
    return this.card.locator('.forklift-overview__throughput-plan-select');
  }

  async selectTimeRange(range: string): Promise<void> {
    await this.timeRangeToggle.click();
    await this.page.getByRole('option', { name: range }).click();
  }

  get timeRangeToggle(): Locator {
    return this.card.locator('.forklift-overview__cards-select');
  }

  async verifyCardVisible(): Promise<void> {
    await expect(this.card).toBeVisible();
    await expect(this.cardTitle).toHaveText(this.title);
  }

  async verifyHasChartData(timeout: number = DATA_LOAD_TIMEOUT_MS): Promise<void> {
    await expect
      .poll(
        async () => {
          const text = await this.planBadge.textContent().catch(() => '0');
          return Number(text);
        },
        { message: `Expected ${this.title} plan badge count > 0`, timeout },
      )
      .toBeGreaterThan(0);
  }

  async verifyPlanInFilter(planName: string): Promise<void> {
    await this.planFilterToggle.click();
    await expect(this.page.getByText(planName).first()).toBeVisible();
    await this.page.keyboard.press('Escape');
  }

  async verifyTimeRangeSelected(range: string): Promise<void> {
    await expect(this.timeRangeToggle).toContainText(range);
  }
}
