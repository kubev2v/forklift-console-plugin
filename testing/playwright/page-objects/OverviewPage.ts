import { expect, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';

import { LearningExperienceDrawer } from './LearningExperienceDrawer';

// Re-export TopicConfig for backward compatibility
export type { TopicConfig } from './LearningExperienceDrawer';

export class OverviewPage {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;

  /** Learning experience drawer - available on all MTV pages */
  public readonly learningExperience: LearningExperienceDrawer;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
    this.learningExperience = new LearningExperienceDrawer(page);
  }

  async editAndSaveTransferNetwork(): Promise<void> {
    await this.openSettingsEditModal();
    await this.toggleTransferNetworkValue();
    await this.saveSettings();
  }

  async getTransferNetworkCurrentValue(): Promise<string | null> {
    return this.transferNetworkDropdown.textContent();
  }

  get modalConfirmButton() {
    return this.page.getByTestId('modal-confirm-button');
  }

  async navigateDirectly() {
    await this.navigation.navigateToOverview();
    await this.waitForPageLoad();
  }

  async navigateToSettings() {
    await this.navigation.navigateToOverviewSettings();
    await this.waitForSettingsPageLoad();
  }

  async openSettingsEditModal(): Promise<void> {
    await this.settingsEditButton.click();
    await expect(this.settingsEditModal).toBeVisible();
  }

  async openTransferNetworkDropdown(): Promise<void> {
    await this.transferNetworkDropdown.click();
  }

  get pageTitle() {
    return this.page.getByRole('heading', { name: 'Migration Toolkit for Virtualization' });
  }

  async saveSettings(): Promise<void> {
    await this.modalConfirmButton.click();
    await expect(this.settingsEditModal).not.toBeVisible();
  }

  async selectFirstAvailableNetwork(): Promise<void> {
    await this.transferNetworkOptions.first().click();
  }

  async selectTransferNetworkNone(): Promise<void> {
    await this.transferNetworkNoneOption.click();
  }

  get settingsEditButton() {
    return this.page.getByTestId('settings-edit-button');
  }

  get settingsEditModal() {
    return this.page.getByTestId('settings-edit-modal');
  }

  get settingsTab() {
    return this.page.getByRole('tab', { name: 'Settings', selected: true });
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

  get transferNetworkDropdown() {
    return this.page.getByTestId('controller-transfer-network-select');
  }

  get transferNetworkField() {
    return this.page.getByTestId('settings-controller-transfer-network');
  }

  get transferNetworkNoneOption() {
    return this.page.getByTestId('controller-transfer-network-select-option-none');
  }

  get transferNetworkOptions() {
    return this.page
      .locator('[data-testid^="controller-transfer-network-select-option-"]')
      .filter({ hasNotText: 'None' });
  }

  async verifyTransferNetworkFieldVisible(): Promise<void> {
    await expect(this.transferNetworkField).toBeVisible();
  }

  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible();
  }

  async waitForSettingsPageLoad() {
    await expect(this.settingsTab).toBeVisible();
  }
}
