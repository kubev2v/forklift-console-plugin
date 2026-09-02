/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- @playwright/test types do not resolve under tsconfig.eslint.json */

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
    // Use the main content area as the root locator since there's no plans-list container
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
    const planLink = this.page.getByRole('link', { exact: true, name: planName });
    await planLink.click();
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
    await expect(this.page.getByRole('link', { exact: true, name: planName })).toHaveCount(0);
  }

  async expectPlanVisible(planName: string): Promise<void> {
    await expect(this.page.getByRole('link', { exact: true, name: planName })).toBeVisible();
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
    // PF Dropdown puts data-testid on the menu popper, which is absent until open.
    await this.page.getByRole('button', { exact: true, name: 'Actions' }).click();
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
    await this.table.search(planName);
  }

  async selectNone(): Promise<void> {
    const pageCheckbox = this.page.getByRole('checkbox', { name: 'Select page' });
    if ((await pageCheckbox.count()) === 0) {
      return;
    }

    await this.page.getByRole('button', { name: 'Bulk select toggle' }).click();
    await this.page.getByRole('menuitem', { name: /Select none/iu }).click();
  }

  async selectPlanByName(planName: string): Promise<void> {
    await this.table.selectRow({ Name: planName });
  }

  async setShowArchived(show: boolean): Promise<void> {
    const archivedSwitch = this.page.getByRole('switch', { name: 'Show archived' });
    const isChecked = await archivedSwitch.isChecked();
    if (isChecked === show) {
      return;
    }

    // PF v6 Switch thumb intercepts the control; click the label instead.
    await this.page.getByText('Show archived', { exact: true }).click();
    await expect(archivedSwitch).toBeChecked({ checked: show });
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
