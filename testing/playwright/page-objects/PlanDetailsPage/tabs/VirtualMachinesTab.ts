import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';
import { VirtualMachinesTable } from '../../common/VirtualMachinesTable';
import { AddVirtualMachinesModal } from '../modals/AddVirtualMachinesModal';

import { ConcernsHelpers } from './ConcernsHelpers';
import { PlanVmInstanceTypeModal } from './PlanVmInstanceTypeModal';

/** VirtualMachines tab for Plan Details page (flat grid, no folder hierarchy). */
export class VirtualMachinesTab extends VirtualMachinesTable {
  readonly concerns: ConcernsHelpers;
  readonly editVmInstanceTypeModal: PlanVmInstanceTypeModal;

  constructor(page: Page) {
    super(page, page.locator('main'));
    this.concerns = new ConcernsHelpers(page);
    this.editVmInstanceTypeModal = new PlanVmInstanceTypeModal(page);
  }

  private async dismissOpenModals(): Promise<void> {
    await this.cancelButton.click({ timeout: 1000 }).catch(() => undefined);
  }

  private get vmTable() {
    return this.page.getByRole('grid', { name: 'Virtual machines' });
  }

  get addVirtualMachinesButton() {
    return this.page.getByRole('button', { name: 'Add virtual machines' });
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

  async clickAddVirtualMachines(): Promise<AddVirtualMachinesModal> {
    await this.addVirtualMachinesButton.click();
    const modal = new AddVirtualMachinesModal(this.page);
    await modal.waitForModalToOpen();
    return modal;
  }

  async collapseFirstVMDetailsRow(): Promise<void> {
    await this.page.getByRole('button', { name: 'Details' }).first().click();
    await this.page.waitForTimeout(300);
  }

  get editInstanceTypeModal() {
    return this.editVmInstanceTypeModal.root;
  }

  get editSharedDisksModal() {
    return this.page.getByTestId('edit-vm-shared-disks-modal');
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

  override async getFirstVMName(): Promise<string> {
    await this.vmTable.waitFor({ state: 'visible' });
    const bodyRowgroup = this.vmTable.getByRole('rowgroup').nth(1);
    const firstRow = bodyRowgroup.getByRole('row').first();
    const nameCell = firstRow.getByRole('gridcell').nth(2);
    const vmName = await nameCell.textContent();
    return vmName?.trim() ?? '';
  }
  async getRowCount(): Promise<number> {
    const paginationNav = this.rootLocator.getByRole('navigation', { name: 'Pagination' }).first();

    if (await paginationNav.isVisible().catch(() => false)) {
      const paginationArea = paginationNav.locator('..');
      const text = await paginationArea.textContent();
      const match = text?.match(/of\s+(?<total>\d+)/);

      if (match?.groups?.total) {
        return Number.parseInt(match.groups.total, 10);
      }
    }

    return this.vmTable.getByRole('rowgroup').nth(1).getByRole('row').count();
  }

  async getTableCell(rowColumnName: string, rowValue: string, targetColumnName: string) {
    return this.table.getCell(rowColumnName, rowValue, targetColumnName);
  }

  getVMActionsMenu(vmName: string) {
    return this.table.getRow({ Name: vmName }).getByTestId('vm-actions-menu-toggle');
  }

  async getVmInspectionStatus(vmName: string): Promise<string> {
    const cell = await this.table.getCell('Name', vmName, 'Inspection status');
    return (await cell.textContent())?.trim() ?? '';
  }

  async getVMInstanceType(vmName: string): Promise<string> {
    const cell = await this.table.getCell('Name', vmName, 'Instance type');
    return (await cell.textContent())?.trim() ?? '';
  }

  async getVMPowerState(vmName: string): Promise<string> {
    const cell = await this.table.getCell('Name', vmName, 'Target power state');
    return (await cell.textContent())?.trim() ?? '';
  }

  async getVMSharedDisks(vmName: string): Promise<string> {
    const cell = await this.table.getCell('Name', vmName, 'Shared disks');
    return (await cell.textContent())?.trim() ?? '';
  }

  get instanceTypeModalSaveButton() {
    return this.editVmInstanceTypeModal.confirmButton;
  }

  get instanceTypeModalSelect() {
    return this.editVmInstanceTypeModal.selectToggle;
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    await this.page.locator('[data-test-id="horizontal-link-Virtual machines"]').click();
    await this.page.waitForURL((url) => url.toString().endsWith('/vms'));
  }

  async openInstanceTypeDialog(vmName: string): Promise<void> {
    await this.editVmInstanceTypeModal.openFromKebab(
      vmName,
      (name) => this.getVMActionsMenu(name),
      async () => this.dismissOpenModals(),
    );
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

  async openSharedDisksDialog(vmName: string): Promise<void> {
    await this.dismissOpenModals();
    await this.getVMActionsMenu(vmName).click();
    const menuItem = this.page.getByTestId('edit-vm-shared-disks-menu-item');
    await menuItem.waitFor({ state: 'visible' });
    await menuItem.click();
    await this.editSharedDisksModal.waitFor({ state: 'visible' });
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
    await this.page.waitForLoadState('domcontentloaded');

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

  get sharedDisksModalSaveButton() {
    return this.editSharedDisksModal.getByTestId('modal-confirm-button');
  }
  get sharedDisksOptionDisabled() {
    return this.editSharedDisksModal.getByTestId('shared-disks-option-disabled');
  }
  get sharedDisksOptionEnabled() {
    return this.editSharedDisksModal.getByTestId('shared-disks-option-enabled');
  }

  get sharedDisksOptionInherit() {
    return this.editSharedDisksModal.getByTestId('shared-disks-option-inherit');
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

  async verifyAddVirtualMachinesButtonDisabled(): Promise<void> {
    await expect(this.addVirtualMachinesButton).toBeDisabled();
  }

  async verifyAddVirtualMachinesButtonEnabled(): Promise<void> {
    await expect(this.addVirtualMachinesButton).toBeEnabled();
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

  async waitForVMInstanceType(vmName: string, expected: string): Promise<void> {
    const cell = await this.table.getCell('Name', vmName, 'Instance type');
    await expect(cell).toHaveText(expected);
  }

  async waitForVMPowerState(vmName: string, expectedPowerState: string): Promise<void> {
    const powerStateCell = await this.table.getCell('Name', vmName, 'Target power state');
    await expect(powerStateCell).toHaveText(expectedPowerState);
  }

  async waitForVMSharedDisks(vmName: string, expectedText: string): Promise<void> {
    const cell = await this.table.getCell('Name', vmName, 'Shared disks');
    await expect(cell).toHaveText(expectedText);
  }
}
