import { expect, type Locator, type Page } from '@playwright/test';

export class SettingsEditModal {
  readonly cancelButton: Locator;
  readonly controllerCpuLimitDropdown: Locator;
  readonly controllerMemoryLimitDropdown: Locator;
  readonly controllerTransferNetworkDropdown: Locator;
  readonly inventoryMemoryLimitDropdown: Locator;
  readonly maxVmInFlightInput: Locator;
  readonly modal: Locator;
  protected readonly page: Page;
  readonly preCopyIntervalDropdown: Locator;
  readonly saveButton: Locator;
  readonly snapshotPollingIntervalDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = this.page.getByTestId('settings-edit-modal');
    this.saveButton = this.page.getByTestId('modal-confirm-button');
    this.cancelButton = this.page.getByTestId('modal-cancel-button');
    this.maxVmInFlightInput = this.page
      .getByTestId('max-vm-inflight-input')
      .getByRole('spinbutton');
    this.controllerCpuLimitDropdown = this.page.getByTestId('controller-cpu-limit-select');
    this.controllerMemoryLimitDropdown = this.page.getByTestId('controller-memory-limit-select');
    this.inventoryMemoryLimitDropdown = this.page.getByTestId('inventory-memory-limit-select');
    this.preCopyIntervalDropdown = this.page.getByTestId('precopy-interval-select');
    this.snapshotPollingIntervalDropdown = this.page.getByTestId(
      'snapshot-status-check-rate-select',
    );
    this.controllerTransferNetworkDropdown = this.page.getByTestId(
      'controller-transfer-network-select',
    );
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForModalToClose();
  }

  async decrementMaxVmInFlight(): Promise<void> {
    await this.page.getByRole('button', { name: 'minus' }).first().click();
  }

  async getControllerCpuLimitValue(): Promise<string | null> {
    return this.controllerCpuLimitDropdown.textContent();
  }

  async getControllerMemoryLimitValue(): Promise<string | null> {
    return this.controllerMemoryLimitDropdown.textContent();
  }

  async getInventoryMemoryLimitValue(): Promise<string | null> {
    return this.inventoryMemoryLimitDropdown.textContent();
  }

  async getMaxVmInFlightValue(): Promise<string> {
    return (await this.maxVmInFlightInput.inputValue()) || '';
  }

  async getPrecopyIntervalValue(): Promise<string | null> {
    return this.preCopyIntervalDropdown.textContent();
  }

  async getSnapshotPollingIntervalValue(): Promise<string | null> {
    return this.snapshotPollingIntervalDropdown.textContent();
  }

  async getTransferNetworkCurrentValue(): Promise<string | null> {
    return this.controllerTransferNetworkDropdown.textContent();
  }

  async incrementMaxVmInFlight(): Promise<void> {
    await this.page.getByRole('button', { name: 'plus' }).first().click();
  }

  async openTransferNetworkDropdown(): Promise<void> {
    await this.controllerTransferNetworkDropdown.click();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
    await this.waitForModalToClose();
  }

  async selectControllerCpuLimit(value: string): Promise<void> {
    await this.controllerCpuLimitDropdown.click();
    await this.page.getByTestId(`controller-cpu-limit-select-option-${value}`).click();
  }

  async selectControllerMemoryLimit(value: string): Promise<void> {
    await this.controllerMemoryLimitDropdown.click();
    await this.page.getByTestId(`controller-memory-limit-select-option-${value}`).click();
  }

  async selectFirstAvailableNetwork(): Promise<void> {
    const options = this.page
      .locator('[data-testid^="controller-transfer-network-select-option-"]')
      .filter({ hasNotText: 'None' });
    await options.first().click();
  }

  async selectInventoryMemoryLimit(value: string): Promise<void> {
    await this.inventoryMemoryLimitDropdown.click();
    await this.page.getByTestId(`inventory-memory-limit-select-option-${value}`).click();
  }

  async selectPrecopyInterval(value: number): Promise<void> {
    await this.preCopyIntervalDropdown.click();
    await this.page.getByTestId(`precopy-interval-select-option-${value}`).click();
  }

  async selectSnapshotPollingInterval(value: number): Promise<void> {
    await this.snapshotPollingIntervalDropdown.click();
    await this.page.getByTestId(`snapshot-status-check-rate-select-option-${value}`).click();
  }

  async selectTransferNetworkNone(): Promise<void> {
    await this.page.getByTestId('controller-transfer-network-select-option-none').click();
  }

  async setMaxVmInFlight(value: number): Promise<void> {
    await this.maxVmInFlightInput.fill(String(value));
  }

  async toggleTransferNetworkValue(): Promise<void> {
    const currentValue = await this.getTransferNetworkCurrentValue();
    await this.openTransferNetworkDropdown();

    const hasNetworkSelected = currentValue?.includes('/');

    if (hasNetworkSelected) {
      await this.selectTransferNetworkNone();
    } else {
      await this.selectFirstAvailableNetwork();
    }
  }

  async waitForModalToClose(): Promise<void> {
    await expect(this.modal).not.toBeVisible();
  }

  async waitForModalToOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }
}
