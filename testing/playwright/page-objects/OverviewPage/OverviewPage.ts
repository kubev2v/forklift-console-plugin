import { expect, type Locator, type Page } from '@playwright/test';

import { NavigationHelper } from '../../utils/NavigationHelper';
import { LearningExperienceDrawer } from '../LearningExperienceDrawer';

import { ThroughputCard } from './components/ThroughputCard';
import { SettingsTab } from './tabs/SettingsTab';

export type { TopicConfig } from '../LearningExperienceDrawer';

export class OverviewPage {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;
  public readonly learningExperience: LearningExperienceDrawer;
  public readonly networkThroughputCard: ThroughputCard;
  public readonly settingsTab: SettingsTab;
  public readonly storageThroughputCard: ThroughputCard;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
    this.learningExperience = new LearningExperienceDrawer(page);
    this.networkThroughputCard = new ThroughputCard(page, 'Network throughput');
    this.settingsTab = new SettingsTab(page);
    this.storageThroughputCard = new ThroughputCard(page, 'Storage throughput');
  }

  async editAndSaveTransferNetwork(): Promise<void> {
    await this.settingsTab.editAndSaveTransferNetwork();
  }

  async getTransferNetworkCurrentValue(): Promise<string | null> {
    return this.settingsTab.getTransferNetworkCurrentValue();
  }

  get mcpWarningBanner(): Locator {
    return this.page.locator('.pf-v6-c-alert').filter({
      hasText: 'AI assistant not connected to Lightspeed',
    });
  }

  get mcpWarningLink(): Locator {
    return this.mcpWarningBanner.getByRole('link', { name: 'Go to Installed Operators' });
  }

  get modalConfirmButton() {
    return this.page.getByTestId('modal-confirm-button');
  }

  async navigateDirectly() {
    await this.navigation.navigateToOverview();
    await this.waitForPageLoad();
  }

  async navigateToSettings() {
    await this.settingsTab.navigateToSettings();
  }

  async openSettingsEditModal(): Promise<void> {
    await this.settingsTab.openSettingsEditModal();
  }

  async openTransferNetworkDropdown(): Promise<void> {
    await this.settingsTab.settingsEditModal.openTransferNetworkDropdown();
  }

  get pageTitle() {
    return this.page.getByRole('heading', { name: 'Migration Toolkit for Virtualization' });
  }

  async saveSettings(): Promise<void> {
    await this.settingsTab.settingsEditModal.save();
  }

  async selectFirstAvailableNetwork(): Promise<void> {
    await this.settingsTab.settingsEditModal.selectFirstAvailableNetwork();
  }

  async selectTransferNetworkNone(): Promise<void> {
    await this.settingsTab.settingsEditModal.selectTransferNetworkNone();
  }

  get settingsEditButton() {
    return this.settingsTab.settingsEditButton;
  }

  get settingsEditModal() {
    return this.settingsTab.settingsEditModal.modal;
  }

  get settingsTabLocator() {
    return this.settingsTab.settingsTab;
  }

  async toggleTransferNetworkValue(): Promise<void> {
    await this.settingsTab.settingsEditModal.toggleTransferNetworkValue();
  }

  get transferNetworkDropdown() {
    return this.settingsTab.settingsEditModal.controllerTransferNetworkDropdown;
  }

  get transferNetworkField() {
    return this.settingsTab.controllerTransferNetworkField;
  }

  get transferNetworkNoneOption() {
    return this.page.getByTestId('controller-transfer-network-select-option-none');
  }

  get transferNetworkOptions() {
    return this.page
      .locator('[data-testid^="controller-transfer-network-select-option-"]')
      .filter({ hasNotText: 'None' });
  }

  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible();
  }
}
