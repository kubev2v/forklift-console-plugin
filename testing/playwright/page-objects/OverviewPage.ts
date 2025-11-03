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

  get choosingMigrationTypeOption() {
    return this.page.getByText('Choosing the right migration type', { exact: true }).first();
  }

  get closeDrawerButton() {
    return this.page.getByRole('button', { name: 'Close drawer panel' });
  }

  async closeTipsAndTricks() {
    await expect(this.closeDrawerButton).toBeVisible();
    await this.closeDrawerButton.click();
    await expect(this.tipsAndTricksDrawerTitle).not.toBeVisible();
  }

  get keyTerminologyOption() {
    return this.page.getByText('Key terminology', { exact: true }).first();
  }

  get migratingVMsOption() {
    return this.page.getByText('Migrating your virtual machines', { exact: true }).first();
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
    await this.page.getByRole('button', { name: currentTopicName }).first().click();
    await this.page.getByRole('option', { name: nextTopicName }).click();
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

  get pageTitle() {
    return this.page.getByRole('heading', { name: 'Migration Toolkit for Virtualization' });
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

  async testAccordionsStructure(minimumCount: number): Promise<void> {
    const accordions = this.page.locator('.pf-v5-c-expandable-section');
    await expect(accordions.first()).toBeVisible({ timeout: 10000 });

    const count = await accordions.count();
    expect(count).toBeGreaterThanOrEqual(minimumCount);

    const testCount = Math.min(3, count);
    for (let i = 0; i < testCount; i += 1) {
      const accordion = accordions.nth(i);
      const toggleButton = accordion.locator('button').first();

      await toggleButton.scrollIntoViewIfNeeded();
      await expect(toggleButton).toBeVisible();

      // Expand then collapse (mimicking old behavior without state assertions)
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

  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible({ timeout: 30000 });
  }
}
