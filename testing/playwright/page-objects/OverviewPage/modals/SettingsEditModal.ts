import { expect, type Locator, type Page } from '@playwright/test';

import { V2_12_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { BaseModal } from '../../common/BaseModal';

/**
 * Page object for the Settings Edit Modal on the Overview page.
 * Extends BaseModal with settings-specific functionality for configuring
 * Forklift operator settings like CPU limits, memory limits, and intervals.
 *
 * On 2.12+, locators use data-testid attributes added to each setting input.
 * On 2.11, setting inputs lack testIds. Locators fall back to:
 *   - role='spinbutton' for the NumberInput (unique within the modal)
 *   - the project class 'forklift-overview__settings-select' indexed by position
 *   - role='option' for selecting dropdown values by display text
 */
export class SettingsEditModal extends BaseModal {
  readonly aapTimeoutInput: Locator;
  readonly aapTokenSecretDropdown: Locator;
  readonly aapUrlInput: Locator;
  readonly controllerCpuLimitDropdown: Locator;
  readonly controllerMemoryLimitDropdown: Locator;
  readonly controllerTransferNetworkDropdown: Locator;
  readonly inventoryMemoryLimitDropdown: Locator;
  readonly maxVmInFlightInput: Locator;
  readonly preCopyIntervalDropdown: Locator;
  readonly snapshotPollingIntervalDropdown: Locator;

  constructor(page: Page) {
    super(page, 'settings-edit-modal');

    if (isVersionAtLeast(V2_12_0)) {
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
    } else {
      this.maxVmInFlightInput = this.modal.getByRole('spinbutton');
      const selects = this.modal.locator('.forklift-overview__settings-select');
      this.controllerCpuLimitDropdown = selects.nth(0);
      this.controllerMemoryLimitDropdown = selects.nth(1);
      this.inventoryMemoryLimitDropdown = selects.nth(2);
      this.preCopyIntervalDropdown = selects.nth(3);
      this.snapshotPollingIntervalDropdown = selects.nth(4);
    }

    this.controllerTransferNetworkDropdown = this.page.getByTestId(
      'controller-transfer-network-select',
    );

    this.aapUrlInput = this.page.getByTestId('aap-url-settings-input');
    this.aapTokenSecretDropdown = this.page.getByTestId('aap-token-secret-settings-select');
    this.aapTimeoutInput = this.page
      .getByTestId('settings-aap-timeout-input')
      .getByRole('spinbutton');
  }

  private async selectOptionByTestIdOrText(
    dropdown: Locator,
    testIdPrefix: string,
    optionKey: string | number,
    displayText?: string,
  ): Promise<void> {
    await dropdown.click();

    if (isVersionAtLeast(V2_12_0)) {
      await this.page.getByTestId(`${testIdPrefix}-option-${optionKey}`).click();
    } else {
      const text = displayText ?? String(optionKey);
      await this.modal.getByRole('menuitem', { name: text }).click();
    }
  }

  async decrementMaxVmInFlight(): Promise<void> {
    await this.page
      .getByTestId('max-vm-inflight-input')
      .getByRole('button', { name: 'minus' })
      .click();
  }

  async getAapTimeoutValue(): Promise<string> {
    return (await this.aapTimeoutInput.inputValue()) ?? '';
  }

  async getAapUrlValue(): Promise<string> {
    return (await this.aapUrlInput.inputValue()) ?? '';
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
    await this.page
      .getByTestId('max-vm-inflight-input')
      .getByRole('button', { name: 'plus' })
      .click();
  }

  async openTransferNetworkDropdown(): Promise<void> {
    await this.controllerTransferNetworkDropdown.click();
  }

  async selectControllerCpuLimit(value: string): Promise<void> {
    await this.selectOptionByTestIdOrText(
      this.controllerCpuLimitDropdown,
      'controller-cpu-limit-select',
      value,
    );
  }

  async selectControllerMemoryLimit(value: string): Promise<void> {
    await this.selectOptionByTestIdOrText(
      this.controllerMemoryLimitDropdown,
      'controller-memory-limit-select',
      value,
    );
  }

  async selectFirstAvailableNetwork(): Promise<void> {
    const options = this.page
      .locator('[data-testid^="controller-transfer-network-select-option-"]')
      .filter({ hasNotText: 'None' });
    await options.first().click();
  }

  async selectInventoryMemoryLimit(value: string): Promise<void> {
    await this.selectOptionByTestIdOrText(
      this.inventoryMemoryLimitDropdown,
      'inventory-memory-limit-select',
      value,
    );
  }

  async selectPrecopyInterval(value: number): Promise<void> {
    await this.selectOptionByTestIdOrText(
      this.preCopyIntervalDropdown,
      'precopy-interval-select',
      value,
      `${value}min`,
    );
  }

  async selectSnapshotPollingInterval(value: number): Promise<void> {
    await this.selectOptionByTestIdOrText(
      this.snapshotPollingIntervalDropdown,
      'snapshot-status-check-rate-select',
      value,
      `${value}s`,
    );
  }

  async selectTransferNetworkNone(): Promise<void> {
    await this.page.getByTestId('controller-transfer-network-select-option-none').click();
  }

  async setAapTimeout(value: number): Promise<void> {
    await this.aapTimeoutInput.fill(String(value));
  }

  async setAapUrl(url: string): Promise<void> {
    await this.aapUrlInput.clear();
    await this.aapUrlInput.fill(url);
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

  async verifyAapFieldsVisible(): Promise<void> {
    await expect(this.aapUrlInput).toBeVisible();
    await expect(this.aapTokenSecretDropdown).toBeVisible();
    await expect(this.aapTimeoutInput).toBeVisible();
  }
}
