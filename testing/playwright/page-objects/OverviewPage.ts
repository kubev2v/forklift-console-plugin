import { expect, type Locator, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';

export interface TopicConfig {
  name: string;
  description: string;
  minimumAccordions?: number;
}

export class OverviewPage {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
  }

  async cancelSettingsEdit(): Promise<void> {
    await this.modalCancelButton.click();
  }

  get choosingMigrationTypeOption() {
    return this.page.getByText('Choosing the right migration type', { exact: true }).first();
  }

  get closeDrawerButton() {
    return this.page.getByRole('button', { name: 'Close drawer panel' });
  }

  async closeDropdownWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async closeTipsAndTricks() {
    await expect(this.closeDrawerButton).toBeVisible();
    await this.closeDrawerButton.click();
    await expect(this.tipsAndTricksDrawerTitle).not.toBeVisible();
  }

  async editAndSaveTransferNetwork(): Promise<void> {
    await this.openSettingsEditModal();
    await this.toggleTransferNetworkValue();
    await this.saveSettings();
  }

  async getTransferNetworkCurrentValue(): Promise<string | null> {
    return this.transferNetworkDropdown.textContent();
  }

  get keyTerminologyOption() {
    return this.page.getByText('Key terminology', { exact: true }).first();
  }

  get migratingVMsOption() {
    return this.page.getByText('Migrating your virtual machines', { exact: true }).first();
  }

  get modalCancelButton() {
    return this.page.getByTestId('modal-cancel-button');
  }

  get modalConfirmButton() {
    return this.page.getByTestId('modal-confirm-button');
  }

  async navigateDirectly() {
    await this.navigation.navigateToOverview();
    await this.waitForPageLoad();
  }

  async navigateFromMainMenu() {
    await this.navigation.navigateToOverview();
    await this.waitForPageLoad();
  }

  async navigateToNextTopic(currentTopicName: string, nextTopicName: string): Promise<void> {
    await this.selectTopicButton.click();
    await this.page.getByRole('option', { name: nextTopicName }).click();
  }

  async navigateToSettings() {
    await this.navigation.navigateToOverviewSettings();
    await this.waitForSettingsPageLoad();
  }

  async openSettingsEditModal(): Promise<void> {
    await this.settingsEditButton.click();
    await expect(this.settingsEditModal).toBeVisible();
  }

  async openTipsAndTricks() {
    await expect(this.tipsAndTricksButton).toBeVisible({ timeout: 10000 });
    await this.tipsAndTricksButton.click();
    await expect(this.tipsAndTricksDrawerTitle).toBeVisible({ timeout: 10000 });
  }

  async openTipsAndTricksDrawer(): Promise<{
    drawerTitle: Locator;
    selectTopicButton: Locator;
    closeDrawerButton: Locator;
  }> {
    await this.openTipsAndTricks();

    await expect(this.selectTopicButton).toBeVisible();
    await expect(this.closeDrawerButton).toBeVisible();

    return {
      drawerTitle: this.tipsAndTricksDrawerTitle,
      selectTopicButton: this.selectTopicButton,
      closeDrawerButton: this.closeDrawerButton,
    };
  }

  async openTransferNetworkDropdown(): Promise<void> {
    await this.transferNetworkDropdown.click();
  }

  get pageTitle() {
    return this.page.getByRole('heading', { name: 'Migration Toolkit for Virtualization' });
  }

  async saveSettings(): Promise<void> {
    await this.modalConfirmButton.click();
    await expect(this.settingsEditModal).not.toBeVisible({ timeout: 10000 });
  }

  async selectFirstAvailableNetwork(): Promise<void> {
    await this.transferNetworkOptions.first().click();
  }

  async selectTopic(
    topicName: 'migrating-vms' | 'migration-type' | 'troubleshooting' | 'terminology',
  ) {
    const topicMap = {
      'migrating-vms': this.migratingVMsOption,
      'migration-type': this.choosingMigrationTypeOption,
      troubleshooting: this.troubleshootingOption,
      terminology: this.keyTerminologyOption,
    };

    const topic = topicMap[topicName];
    await expect(topic).toBeVisible();
    await topic.click();
  }

  get selectTopicButton() {
    return this.page.getByRole('button', { name: 'Select a topic' });
  }

  async selectTopicByCard(topicConfig: TopicConfig): Promise<void> {
    await this.page.getByTestId('topic-card').filter({ hasText: topicConfig.name }).click();
    await expect(
      this.page.getByRole('heading', { name: topicConfig.name, level: 3 }),
    ).toBeVisible();
  }

  async selectTopicByName(topicName: string): Promise<void> {
    await this.page.getByTestId('topic-card').filter({ hasText: topicName }).click();
    await this.verifyTopicHeading(topicName);
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

  async testAccordionsStructure(minimumCount: number): Promise<void> {
    const accordions = this.page.getByTestId('help-topic-section');
    await expect(accordions.first()).toBeVisible({ timeout: 10000 });

    const count = await accordions.count();
    expect(count).toBeGreaterThanOrEqual(minimumCount);

    const testCount = Math.min(3, count);
    for (let i = 0; i < testCount; i += 1) {
      const accordion = accordions.nth(i);
      const toggleButton = accordion.locator('button').first();

      await toggleButton.scrollIntoViewIfNeeded();
      await expect(toggleButton).toBeVisible();
      await toggleButton.click();
      await toggleButton.click();
    }
  }

  get tipsAndTricksButton() {
    return this.page.getByRole('button', { name: 'Tips and tricks' });
  }

  get tipsAndTricksDrawerTitle() {
    return this.page.getByRole('heading', { name: 'Tips and tricks', level: 2 });
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

  get troubleshootingOption() {
    return this.page.getByText('Troubleshooting', { exact: true }).first();
  }

  async verifyPicklist(topics: TopicConfig[]): Promise<void> {
    await this.selectTopicButton.click();

    for (const topic of topics) {
      await expect(this.page.getByRole('option', { name: topic.name })).toBeVisible();
    }

    await this.selectTopicButton.click();
  }

  async verifyTopicCards(topics: TopicConfig[]): Promise<void> {
    for (const topic of topics) {
      await expect(this.page.getByText(topic.name)).toBeVisible();
      await expect(this.page.getByText(topic.description)).toBeVisible();
    }
  }

  async verifyTopicHeading(topicName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: topicName, level: 3 })).toBeVisible();
  }

  async verifyTransferNetworkFieldVisible(): Promise<void> {
    await expect(this.transferNetworkField).toBeVisible();
  }

  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible({ timeout: 30000 });
  }

  async waitForSettingsPageLoad() {
    await expect(this.settingsTab).toBeVisible({ timeout: 30000 });
  }
}
