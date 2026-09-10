import { expect, type Locator, type Page } from '@playwright/test';

import { NavigationHelper } from '../../../utils/NavigationHelper';
import { PAGE_LOAD_INITIAL_TIMEOUT_MS, PAGE_LOAD_RETRY_TIMEOUT_MS } from '../../../utils/timeouts';
import { waitForVisibleWithReload } from '../../../utils/utils';
import { SettingsEditModal } from '../modals/SettingsEditModal';

export class SettingsTab {
  private readonly navigation: NavigationHelper;
  readonly aapTimeoutField: Locator;
  readonly aapTokenSecretField: Locator;
  readonly aapUrlField: Locator;
  readonly controllerTransferNetworkField: Locator;
  readonly maxVmInFlightField: Locator;
  protected readonly page: Page;
  readonly settingsEditButton: Locator;
  readonly settingsEditModal: SettingsEditModal;
  readonly settingsTab: Locator;
  readonly virtV2vMemsizeField: Locator;
  readonly virtV2vSmpField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
    this.settingsTab = this.page.getByRole('tab', { name: 'Settings' });
    this.settingsEditButton = this.page.getByTestId('settings-edit-button');
    this.controllerTransferNetworkField = this.page.getByTestId(
      'settings-controller-transfer-network',
    );
    this.maxVmInFlightField = this.page.locator('dd').first();
    this.aapUrlField = this.page.getByTestId('settings-aap-url');
    this.aapTokenSecretField = this.page.getByTestId('settings-aap-token-secret');
    this.aapTimeoutField = this.page.getByTestId('settings-aap-timeout');
    this.settingsEditModal = new SettingsEditModal(page);
    this.virtV2vMemsizeField = this.page.getByTestId('settings-virt-v2v-memsize');
    this.virtV2vSmpField = this.page.getByTestId('settings-virt-v2v-smp');
  }

  async editAndSaveTransferNetwork(): Promise<void> {
    await this.openSettingsEditModal();
    await this.settingsEditModal.toggleTransferNetworkValue();
    await this.settingsEditModal.save();
  }

  async expectVirtV2vUnsetOnCard(): Promise<void> {
    await expect(this.virtV2vMemsizeField).toContainText('Default');
    await expect(this.virtV2vSmpField).toContainText('Default');
  }

  getTransferNetworkCurrentValue(): Promise<string | null> {
    return this.controllerTransferNetworkField.textContent();
  }

  async navigateToSettings(): Promise<void> {
    await this.navigation.navigateToOverview();
    await waitForVisibleWithReload(
      this.page,
      this.settingsTab,
      PAGE_LOAD_INITIAL_TIMEOUT_MS,
      PAGE_LOAD_RETRY_TIMEOUT_MS,
    );
    await this.settingsTab.click();
    await expect(this.settingsEditButton).toBeVisible();
  }

  async openSettingsEditModal(): Promise<void> {
    await this.settingsEditButton.click();
    await this.settingsEditModal.waitForModalToOpen();
  }
}
