import type { Locator, Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

/**
 * Page object for the Settings Edit Modal on the Overview page.
 * Extends BaseModal with settings-specific functionality for configuring
 * Forklift operator settings like CPU limits, memory limits, and intervals.
 */
export class SettingsEditModal extends BaseModal {
  readonly controllerCpuLimitDropdown: Locator;
  readonly controllerMemoryLimitDropdown: Locator;
  readonly controllerTransferNetworkDropdown: Locator;
  readonly inventoryMemoryLimitDropdown: Locator;
  readonly maxVmInFlightInput: Locator;
  readonly preCopyIntervalDropdown: Locator;
  readonly snapshotPollingIntervalDropdown: Locator;

  constructor(page: Page) {
    super(page, 'settings-edit-modal');
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

  async decrementMaxVmInFlight(): Promise<void> {
    await this.page.getByRole('button', { name: 'minus' }).first().click();
  }

  async getControllerCpuLimitValue(): Promise<string | null> {
    return await this.controllerCpuLimitDropdown.textContent();
  }

  async getControllerMemoryLimitValue(): Promise<string | null> {
    return await this.controllerMemoryLimitDropdown.textContent();
  }

  async getInventoryMemoryLimitValue(): Promise<string | null> {
    return await this.inventoryMemoryLimitDropdown.textContent();
  }

  async getMaxVmInFlightValue(): Promise<string> {
    return (await this.maxVmInFlightInput.inputValue()) ?? '';
  }

  async getPrecopyIntervalValue(): Promise<string | null> {
    return await this.preCopyIntervalDropdown.textContent();
  }

  async getSnapshotPollingIntervalValue(): Promise<string | null> {
    return await this.snapshotPollingIntervalDropdown.textContent();
  }

  async getTransferNetworkCurrentValue(): Promise<string | null> {
    return await this.controllerTransferNetworkDropdown.textContent();
  }

  async incrementMaxVmInFlight(): Promise<void> {
    await this.page.getByRole('button', { name: 'plus' }).first().click();
  }

  async openTransferNetworkDropdown(): Promise<void> {
    await this.controllerTransferNetworkDropdown.click();
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
}
