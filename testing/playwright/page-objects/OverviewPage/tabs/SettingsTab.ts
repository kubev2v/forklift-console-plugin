import { expect, type Locator, type Page } from '@playwright/test';

const PAGE_LOAD_INITIAL_TIMEOUT_MS = 10_000;
const PAGE_LOAD_RETRY_TIMEOUT_MS = 20_000;

import { NavigationHelper } from '../../../utils/NavigationHelper';
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
  }

  async editAndSaveTransferNetwork(): Promise<void> {
    await this.openSettingsEditModal();
    await this.settingsEditModal.toggleTransferNetworkValue();
    await this.settingsEditModal.save();
  }

  async getTransferNetworkCurrentValue(): Promise<string | null> {
    return await this.controllerTransferNetworkField.textContent();
  }

  async navigateToSettings(): Promise<void> {
    await this.navigation.navigateToOverview();
    // Dynamic plugin may not have registered its routes yet; retry with a reload if needed.
    try {
      await expect(this.settingsTab).toBeVisible({ timeout: PAGE_LOAD_INITIAL_TIMEOUT_MS });
    } catch {
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(this.settingsTab).toBeVisible({ timeout: PAGE_LOAD_RETRY_TIMEOUT_MS });
    }
    await this.settingsTab.click();
    await expect(this.settingsEditButton).toBeVisible();
  }

  async openSettingsEditModal(): Promise<void> {
    await this.settingsEditButton.click();
    await this.settingsEditModal.waitForModalToOpen();
  }
}
