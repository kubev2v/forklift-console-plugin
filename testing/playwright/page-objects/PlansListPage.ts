import { expect, type Locator, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

import { Table } from './common/Table';

export class PlansListPage {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;
  private readonly table: Table;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(page, page.locator('main'));
    this.navigation = new NavigationHelper(page);
  }

  get archiveMenuItem(): Locator {
    return this.page.getByTestId('bulk-archive-plans-menuitem');
  }

  async assertCreatePlanButtonEnabled() {
    await expect(this.createPlanButton).toBeVisible();
    await expect(this.createPlanButton).toBeEnabled();
    await expect(this.createPlanButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async cancelBulkModal(): Promise<void> {
    await this.page.getByTestId('modal-cancel-button').click();
  }

  async clickCreatePlanButton() {
    await this.assertCreatePlanButtonEnabled();
    await this.createPlanButton.click();
  }

  async clickPlanByName(planName: string): Promise<void> {
    await this.page.getByTestId(`plan-link-${planName}`).click();
  }

  async confirmBulkModal(): Promise<void> {
    await this.page.getByTestId('modal-confirm-button').click();
  }

  get createPlanButton() {
    return this.page.getByTestId('create-plan-button');
  }

  get deleteMenuItem(): Locator {
    return this.page.getByTestId('bulk-delete-plans-menuitem');
  }

  async expectPlanHidden(planName: string): Promise<void> {
    await expect(this.page.getByTestId(`plan-link-${planName}`)).toHaveCount(0);
  }

  async expectPlanVisible(planName: string): Promise<void> {
    await expect(this.page.getByTestId(`plan-link-${planName}`)).toBeVisible();
  }

  async navigateDirectly(namespace = MTV_NAMESPACE): Promise<void> {
    await this.navigation.navigateToK8sResource({ namespace, resource: 'Plan' });
    await this.waitForPageLoad();
  }

  async navigateFromMainMenu() {
    await this.navigation.navigateToPlans();
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan');
  }

  async navigateToPlan(planName: string): Promise<void> {
    await this.searchForPlan(planName);
    await this.clickPlanByName(planName);
  }

  async openBulkActions(): Promise<void> {
    await this.page.getByTestId('plans-bulk-actions-toggle').click();
  }

  async openBulkArchiveModal(): Promise<Locator> {
    await this.openBulkActions();
    await this.archiveMenuItem.click();
    const modal = this.page.getByTestId('bulk-archive-plans-modal');
    await expect(modal).toBeVisible();
    return modal;
  }

  async openBulkDeleteModal(): Promise<Locator> {
    await this.openBulkActions();
    await this.deleteMenuItem.click();
    const modal = this.page.getByTestId('bulk-delete-plans-modal');
    await expect(modal).toBeVisible();
    return modal;
  }

  async searchForPlan(planName: string): Promise<void> {
    const searchInput = this.page.getByTestId('name-search-input');
    await searchInput.fill(planName);
    await searchInput.press('Enter');
  }

  async selectNone(): Promise<void> {
    const checkbox = this.page.getByTestId('table-bulk-select-checkbox');
    if ((await checkbox.count()) === 0) {
      return;
    }

    await this.page.getByTestId('table-bulk-select-toggle').click();
    await this.page.getByTestId('table-bulk-select-select-none').click();
  }

  async selectPlanByName(planName: string): Promise<void> {
    const row = this.page.locator('tr').filter({
      has: this.page.getByTestId(`plan-link-${planName}`),
    });
    await row.getByTestId('row-select-checkbox').getByRole('checkbox').check();
  }

  async setShowArchived(show: boolean): Promise<void> {
    const archivedSwitch = this.page.getByTestId('archived-switch');
    const isChecked = await archivedSwitch.isChecked();
    if (isChecked === show) {
      return;
    }

    // PF v6 Switch thumb intercepts the input; click the wrapping label instead.
    await this.page.locator('label').filter({ has: archivedSwitch }).click();
    await expect(archivedSwitch).toBeChecked({ checked: show });
  }

  async waitForPageLoad() {
    await expect(this.page.getByTestId('plans-list')).toBeVisible();
    await this.table.waitForTableLoad();
  }
}
