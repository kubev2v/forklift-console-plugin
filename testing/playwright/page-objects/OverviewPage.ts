import { expect, type Locator, type Page } from '@playwright/test';

import { NavigationHelper } from '../utils/NavigationHelper';

/** Configuration for an accordion item within a topic */
export interface AccordionTest {
  buttonName: string;
  sampleContent?: string; // Optional: text to verify when expanded
}

/** Configuration for a Tips and Tricks topic */
export interface TopicConfig {
  name: string;
  cardText: string;
  description: string;
  accordions: AccordionTest[];
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
    await expect(this.closeDrawerButton).toBeVisible({ timeout: 5000 });
    await this.closeDrawerButton.click();
    // Wait for drawer to close
    await expect(this.tipsAndTricksDrawerTitle).not.toBeVisible({ timeout: 5000 });
  }

  /** Dismisses the tour dialog if it appears */
  async dismissTourDialog(): Promise<void> {
    const tourDialog = this.page.getByRole('dialog');
    const tourVisible = await tourDialog.isVisible().catch(() => false);
    if (tourVisible) {
      const skipButton = tourDialog.getByRole('button', { name: 'Skip tour' });
      if (await skipButton.isVisible().catch(() => false)) {
        await skipButton.click();
        await tourDialog.waitFor({ state: 'hidden' });
      }
    }
  }

  get keyTerminologyOption() {
    return this.page.getByText('Key terminology', { exact: true }).first();
  }

  // Tips and tricks topics - target by text within the drawer
  get migratingVMsOption() {
    return this.page.getByText('Migrating your virtual machines', { exact: true }).first();
  }

  async navigateDirectly() {
    await this.page.goto('/mtv/overview');
    await this.page.waitForLoadState('networkidle');

    await this.dismissTourDialog();

    await this.waitForPageLoad();
  }

  async navigateFromMainMenu() {
    await this.navigation.navigateToOverview();
    expect(this.page.url()).toContain('/mtv/overview');
  }

  /** Navigates to next topic using dropdown */
  async navigateToNextTopic(currentTopicName: string, nextTopicName: string): Promise<void> {
    await this.page.getByRole('button', { name: currentTopicName }).first().click(); // Open dropdown
    await this.page.getByRole('option', { name: nextTopicName }).click(); // Select next topic
  }

  async openTipsAndTricks() {
    await expect(this.tipsAndTricksButton).toBeVisible({ timeout: 10000 });
    await this.tipsAndTricksButton.click();
    await expect(this.tipsAndTricksDrawerTitle).toBeVisible({ timeout: 10000 });
  }

  /** Opens the Tips and tricks drawer and returns key locators */
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

  /** Selects a topic by clicking its card and verifies heading */
  async selectTopicByCard(topicConfig: TopicConfig): Promise<void> {
    await this.page.getByTestId('topic-card').filter({ hasText: topicConfig.cardText }).click();
    await expect(
      this.page.getByRole('heading', { name: topicConfig.name, level: 3 }),
    ).toBeVisible();
  }

  /** Tests all accordions - expands, verifies content, then collapses each one */
  async testAllAccordions(accordions: AccordionTest[]): Promise<void> {
    for (const accordion of accordions) {
      const accordionButton = this.page.getByRole('button', { name: accordion.buttonName });

      // Scroll into view if needed before checking visibility
      await accordionButton.scrollIntoViewIfNeeded();
      await expect(accordionButton).toBeVisible();

      // Expand the accordion
      await accordionButton.click();

      // If sample content is specified, verify it appears
      if (accordion.sampleContent) {
        await expect(this.page.getByText(accordion.sampleContent)).toBeVisible();
      }

      await accordionButton.click();
    }
  }

  get tipsAndTricksButton() {
    return this.page.getByRole('button', { name: 'Tips and tricks' });
  }

  // ==============================================================================
  // TIPS AND TRICKS METHODS
  // ==============================================================================

  get tipsAndTricksDrawerTitle() {
    return this.page.getByRole('heading', { name: 'Tips and tricks', level: 2 });
  }

  get troubleshootingOption() {
    return this.page.getByText('Troubleshooting', { exact: true }).first();
  }

  /** Verifies all topics are available in dropdown selector */
  async verifyPicklist(topics: TopicConfig[]): Promise<void> {
    await this.selectTopicButton.click(); // Open dropdown

    for (const topic of topics) {
      await expect(this.page.getByRole('option', { name: topic.name })).toBeVisible();
    }

    await this.selectTopicButton.click(); // Close dropdown
  }

  async verifyTipsAndTricksDrawerVisible() {
    await expect(this.tipsAndTricksDrawerTitle).toBeVisible();
    await expect(this.selectTopicButton).toBeVisible();
  }

  async verifyTipsAndTricksTopics() {
    await expect(this.migratingVMsOption).toBeVisible();
    await expect(this.choosingMigrationTypeOption).toBeVisible();
    await expect(this.troubleshootingOption).toBeVisible();
    await expect(this.keyTerminologyOption).toBeVisible();
  }

  /** Verifies all topic cards are visible with titles and descriptions */
  async verifyTopicCards(topics: TopicConfig[]): Promise<void> {
    for (const topic of topics) {
      await expect(this.page.getByText(topic.name)).toBeVisible();
      await expect(this.page.getByText(topic.description)).toBeVisible();
    }
  }

  /** Verifies topic heading is visible */
  async verifyTopicHeading(topicName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: topicName, level: 3 })).toBeVisible();
  }

  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible({ timeout: 30000 });
  }
}
