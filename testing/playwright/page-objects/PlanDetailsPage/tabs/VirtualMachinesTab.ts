import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';
import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';

/**
 * VirtualMachines tab for Plan Details page.
 * Extends VirtualMachinesTable for flat grid (no folder hierarchy).
 */
export class VirtualMachinesTab extends VirtualMachinesTable {
  constructor(page: Page) {
    super(page, page.locator('main'));
  }

  private async dismissOpenModals(): Promise<void> {
    await this.cancelButton.click({ timeout: 1000 }).catch(() => undefined);
  }

  private get vmTable() {
    return this.page.getByRole('grid', { name: 'Virtual machines' });
  }

  async applyFilter(filterName: string, value: string): Promise<void> {
    await this.page.getByTestId('attribute-filter-toggle').click();
    await this.page.getByRole('menuitem', { name: filterName }).click();
    await this.page.locator('[data-testid^="filter-toggle-"]').first().click();
    await this.page.getByTestId(`filter-value-${value}`).click();
    await this.page.keyboard.press('Escape');
  }

  get cancelButton() {
    return this.page.getByTestId('modal-cancel-button');
  }

  async clearFilters(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Clear all filters' });
    if (await btn.isVisible().catch(() => false)) await btn.click();
  }

  async closeConcernPopover(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByTestId('concerns-popover')).not.toBeVisible();
  }

  async collapseFirstVMDetailsRow(): Promise<void> {
    await this.page.getByRole('button', { name: 'Details' }).first().click();
    await this.page.waitForTimeout(300);
  }

  get editTargetNameMenuItem() {
    return this.page.getByTestId('edit-vm-target-name-menu-item');
  }
  get editTargetPowerStateModal() {
    return this.page.getByTestId('edit-target-power-state-modal');
  }

  async expandFilters(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Show Filters' });
    if (await btn.isVisible()) await btn.click();
  }

  async expandFirstVMDetailsRow(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Details' }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await this.page.waitForTimeout(300);
  }

  getConcernBadge(category: 'critical' | 'warning' | 'information') {
    return this.vmTable.getByTestId(`concern-badge-${category}`).first();
  }

  async getFirstVisibleConcernBadge() {
    for (const category of ['critical', 'warning', 'information'] as const) {
      const badge = this.getConcernBadge(category);
      if (await badge.isVisible().catch(() => false)) {
        return badge;
      }
    }
    return null;
  }

  override async getFirstVMName(): Promise<string> {
    await this.vmTable.waitFor({ state: 'visible' });
    const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
    const firstRow = bodyRowgroup.getByRole('row').first();
    const nameCell = firstRow.getByRole('gridcell').nth(2);
    const vmName = await nameCell.textContent();
    return vmName?.trim() ?? '';
  }

  async getRowCount(): Promise<number> {
    const btn = this.page.locator('button').filter({ hasText: /\d+ - \d+ of \d+/ });
    const text = await btn.first().textContent();
    const match = /of (?<count>\d+)/.exec(text ?? '');
    return match?.groups?.count ? parseInt(match.groups.count, 10) : 0;
  }

  getVMActionsMenu(vmName: string) {
    return this.table.getRow({ Name: vmName }).getByTestId('vm-actions-menu-toggle');
  }

  async getVMPowerState(vmName: string): Promise<string> {
    const cell = await this.table.getCell('Name', vmName, 'Target power state');
    return (await cell.textContent())?.trim() ?? '';
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    await this.page.locator('[data-test-id="horizontal-link-Virtual machines"]').click();
    await this.page.waitForURL((url) => url.toString().endsWith('/vms'));
  }

  async openConcernPopover(category?: 'critical' | 'warning' | 'information'): Promise<boolean> {
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

  async openPowerStateDialog(vmName: string): Promise<void> {
    await this.dismissOpenModals();
    await this.getVMActionsMenu(vmName).click();
    const menuItem = this.page.getByTestId('edit-vm-target-power-state-menu-item');
    await menuItem.waitFor({ state: 'visible' });
    await menuItem.click();
    await this.editTargetPowerStateModal.waitFor({ state: 'visible' });
  }

  async openRenameDialog(vmName: string): Promise<void> {
    await this.dismissOpenModals();
    await this.getVMActionsMenu(vmName).click();
    await this.editTargetNameMenuItem.waitFor({ state: 'visible' });
    await this.editTargetNameMenuItem.click();
    await this.renameTargetNameInput.waitFor({ state: 'visible' });
    await this.renameTargetNameInput.focus();
  }

  get powerStateModalSaveButton() {
    return this.page.getByTestId('modal-confirm-button');
  }
  get powerStateModalSelect() {
    return this.editTargetPowerStateModal.getByTestId('target-power-state-select');
  }
  get powerStateOptionAuto() {
    return this.page.getByRole('option', { name: 'Retain source VM power state', exact: true });
  }
  get powerStateOptionInherit() {
    return this.page.getByRole('option', { name: 'Inherit plan wide setting', exact: false });
  }
  get powerStateOptionOff() {
    return this.page.getByRole('option', { name: 'Powered off', exact: true });
  }
  get powerStateOptionOn() {
    return this.page.getByRole('option', { name: 'Powered on', exact: true });
  }
  get renameTargetNameInput() {
    return this.page.getByTestId('vm-target-name-input');
  }

  async renameVM(sourceName: string, targetName: string): Promise<void> {
    await this.search(sourceName);
    const vmRow = this.table.getRow({ Name: sourceName });
    await expect(vmRow).toBeVisible({ timeout: 2000 });
    await vmRow.getByTestId('vm-actions-menu-toggle').click();
    await this.editTargetNameMenuItem.click();
    await this.renameTargetNameInput.fill(targetName);
    await this.saveButton.click();
    await expect(this.renameTargetNameInput).not.toBeVisible();
    await this.page.waitForLoadState('networkidle');

    // Verify rename was applied
    await this.search(sourceName);
    await this.verifyRowIsVisible({ Name: sourceName });
    await this.dismissOpenModals();
    await this.table.getRow({ Name: sourceName }).getByTestId('vm-actions-menu-toggle').click();
    await this.editTargetNameMenuItem.click();
    await expect(this.renameTargetNameInput).toHaveValue(targetName);
    await this.cancelButton.click();
    await this.clearAllFilters();
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save|confirm/iu });
  }

  async selectVirtualMachine(vmName: string): Promise<void> {
    await this.table.selectRow({ Name: vmName });
  }

  override async sortByColumn(columnName: string): Promise<void> {
    const columnHeader = this.vmTable
      .getByRole('columnheader')
      .getByRole('button', { name: columnName, exact: true });
    await columnHeader.click();
    await expect(columnHeader.locator('[class*="sort-indicator"], .pf-v5-c-table__sort-indicator'))
      .toBeVisible()
      .catch(() => undefined);
  }

  async sortByConcerns(): Promise<void> {
    await this.sortByColumn('Concerns');
  }
  get validationErrorMessage() {
    return this.page.getByTestId('form-helper-text-error');
  }

  async verifyConcernBadgeExists(
    category: 'critical' | 'warning' | 'information',
    rowIndex?: number,
  ): Promise<void> {
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

  async verifyFilteredRowsHaveBadge(
    category: 'critical' | 'warning' | 'information',
  ): Promise<void> {
    const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
    const rows = bodyRowgroup.getByRole('row');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i += 1) {
      await expect(rows.nth(i).getByTestId(`concern-badge-${category}`)).toBeVisible();
    }
  }

  async verifyFilterOptionExists(filterName: string): Promise<void> {
    await this.page.getByTestId('attribute-filter-toggle').click();
    await expect(this.page.getByRole('menuitem', { name: filterName })).toBeVisible();
    await this.page.keyboard.press('Escape');
  }

  async verifyFilterValues(filterName: string, expectedValues?: string[]): Promise<void> {
    await this.page.getByTestId('attribute-filter-toggle').click();
    await this.page.getByRole('menuitem', { name: filterName }).click();
    await this.page.locator('[data-testid^="filter-toggle-"]').first().click();
    if (expectedValues) {
      for (const value of expectedValues) {
        await expect(this.page.getByRole('menuitem', { name: value })).toBeVisible();
      }
    } else {
      expect(await this.page.getByRole('menuitem').count()).toBeGreaterThan(0);
    }
    await this.page.keyboard.press('Escape');
  }

  async verifyVirtualMachinesTab(planData: PlanTestData): Promise<void> {
    await this.table.waitForTableLoad();
    for (const vm of planData.virtualMachines ?? []) {
      if (vm.sourceName) await this.verifyRowIsVisible({ Name: vm.sourceName });
    }
  }

  async waitForVMPowerState(vmName: string, expectedPowerState: string): Promise<void> {
    const powerStateCell = await this.table.getCell('Name', vmName, 'Target power state');
    await expect(powerStateCell).toHaveText(expectedPowerState);
  }
}
