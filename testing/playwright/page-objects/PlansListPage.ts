import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';

import { Table } from './common/Table';

export class PlansListPage {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;
  private readonly table: Table;

  constructor(page: Page) {
    this.page = page;
    // Use the main content area as the root locator since there's no plans-list container
    this.table = new Table(page, page.locator('main'));
    this.navigation = new NavigationHelper(page);
  }

  async assertCreatePlanButtonEnabled() {
    await expect(this.createPlanButton).toBeVisible();
    await expect(this.createPlanButton).toBeEnabled();
    await expect(this.createPlanButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async clickCreatePlanButton() {
    await this.assertCreatePlanButtonEnabled();
    await this.createPlanButton.click();
  }

  async clickPlanByName(planName: string): Promise<void> {
    const planLink = this.page.getByRole('link', { name: planName, exact: true });
    await planLink.click();
  }

  get createPlanButton() {
    return this.page.getByTestId('create-plan-button');
  }

  async navigateFromMainMenu() {
    await this.navigation.navigateToPlans();
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan');
  }

  async navigateToPlan(planName: string): Promise<void> {
    await this.searchForPlan(planName);
    await this.clickPlanByName(planName);
  }

  async searchForPlan(planName: string): Promise<void> {
    await this.table.search(planName);
  }

  async waitForPageLoad() {
    // Support both table and grid roles as some tables are implemented with grid semantics
    await expect(
      this.page
        .getByRole('table', { name: 'Migration plans' })
        .or(this.page.getByRole('grid', { name: 'Migration plans' })),
    ).toBeVisible();
    await this.table.waitForTableLoad();
  }
}
