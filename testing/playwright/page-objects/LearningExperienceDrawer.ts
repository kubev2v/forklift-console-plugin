import { expect, type Locator, type Page } from '@playwright/test';

import { EXTERNAL_LINKS, PROVIDER_TYPES_LIST } from '../fixtures/overview-page-topics';
import { NavigationHelper } from '../utils/NavigationHelper';

export interface TopicConfig {
  name: string;
  description: string;
  minimumAccordions?: number;
}

/**
 * Page object for the Learning Experience (Tips and tricks) drawer.
 * This drawer is available on multiple MTV pages.
 */
export class LearningExperienceDrawer {
  private readonly navigation: NavigationHelper;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
  }

  async close(): Promise<void> {
    await this.closeDrawerButton.click();
    await expect(this.drawerTitle).not.toBeVisible();
  }

  get closeDrawerButton(): Locator {
    return this.page.getByRole('button', { name: 'Close drawer panel' });
  }

  get drawerTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Tips and tricks', level: 2 });
  }

  getExternalLinksHeading(): Locator {
    return this.page.getByRole('heading', { name: 'External links', level: 3 });
  }

  getKeyConsiderationsButton(): Locator {
    return this.page.getByRole('button', { name: 'Key considerations' });
  }

  getKeyTerminologyButton(): Locator {
    return this.page.getByRole('button', { name: 'Key terminology' });
  }

  getProviderTypeDropdown(providerName: string): Locator {
    return this.page.getByRole('button', { name: providerName });
  }

  getProviderTypeMenuItem(providerName: string): Locator {
    return this.page.getByRole('menuitem', { name: providerName });
  }

  getQuickReferenceHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Quick reference', level: 3 });
  }

  getQuickReferenceItemHeading(itemName: string): Locator {
    return this.page.getByRole('heading', { name: itemName, level: 4 });
  }

  getStepButton(stepNumber: number): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${stepNumber}\\.`) });
  }

  async navigateToResource(resource: string, expectedHeading: string): Promise<void> {
    await this.navigation.navigateToK8sResource({ resource, allNamespaces: true });
    await expect(this.page.getByRole('heading', { name: expectedHeading, level: 1 })).toBeVisible();
  }

  async navigateToTopic(nextTopicName: string): Promise<void> {
    await this.selectTopicButton.click();
    await this.page.getByRole('option', { name: nextTopicName }).click();
  }

  async open(): Promise<void> {
    await expect(this.tipsAndTricksButton).toBeVisible();
    await this.tipsAndTricksButton.click();
    await expect(this.drawerTitle).toBeVisible();
  }

  async openAndVerify(): Promise<{
    drawerTitle: Locator;
    selectTopicButton: Locator;
    closeDrawerButton: Locator;
  }> {
    await this.open();

    await expect(this.selectTopicButton).toBeVisible();
    await expect(this.closeDrawerButton).toBeVisible();

    return {
      drawerTitle: this.drawerTitle,
      selectTopicButton: this.selectTopicButton,
      closeDrawerButton: this.closeDrawerButton,
    };
  }

  get openStackAuthTypeText(): Locator {
    return this.page.getByText('Select an authentication type');
  }

  async selectProviderType(currentProvider: string, newProvider: string): Promise<void> {
    await this.getProviderTypeDropdown(currentProvider).click();
    await this.getProviderTypeMenuItem(newProvider).click();
  }

  get selectTopicButton(): Locator {
    return this.page.getByRole('button', { name: 'Select a topic' });
  }

  async selectTopicByCard(topicConfig: TopicConfig): Promise<void> {
    await this.page.getByTestId('topic-card').filter({ hasText: topicConfig.name }).click();
    await expect(
      this.page.getByRole('heading', { name: topicConfig.name, level: 3 }),
    ).toBeVisible();
  }

  async testAccordionsStructure(minimumCount: number): Promise<void> {
    const accordions = this.page.getByTestId('help-topic-section');
    await expect(accordions.first()).toBeVisible();

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

  get tipsAndTricksButton(): Locator {
    return this.page.getByRole('button', { name: 'Tips and tricks' });
  }

  async verifyAllProviderTypesInDropdown(): Promise<void> {
    for (const provider of PROVIDER_TYPES_LIST) {
      await expect(this.getProviderTypeMenuItem(provider)).toBeVisible();
    }
  }

  async verifyExternalLinks(): Promise<void> {
    await expect(this.getExternalLinksHeading()).toBeVisible();
    for (const linkName of EXTERNAL_LINKS) {
      await expect(this.page.getByRole('link', { name: linkName })).toBeVisible();
    }
  }

  async verifyKeyConsiderationsCollapsed(): Promise<void> {
    // First item in KEY_CONSIDERATIONS should not be visible when collapsed
    await expect(this.getQuickReferenceItemHeading('Automatic VM renaming')).not.toBeVisible();
  }

  async verifyKeyConsiderationsItems(items: readonly string[]): Promise<void> {
    for (const item of items) {
      await expect(this.getQuickReferenceItemHeading(item)).toBeVisible();
    }
  }

  async verifyKeyTerminologyCollapsed(): Promise<void> {
    // First item in KEY_TERMINOLOGY should not be visible when collapsed
    await expect(this.getQuickReferenceItemHeading('Cluster')).not.toBeVisible();
  }

  async verifyKeyTerminologyItems(items: readonly string[]): Promise<void> {
    for (const item of items) {
      await expect(this.getQuickReferenceItemHeading(item)).toBeVisible();
    }
  }

  async verifyPicklist(topics: TopicConfig[]): Promise<void> {
    await this.selectTopicButton.click();

    for (const topic of topics) {
      await expect(this.page.getByRole('option', { name: topic.name })).toBeVisible();
    }

    await this.selectTopicButton.click();
  }

  async verifyProviderTypeDropdownVisible(providerName: string): Promise<void> {
    await expect(this.getProviderTypeDropdown(providerName)).toBeVisible();
  }

  async verifyStepVisible(stepNumber: number): Promise<void> {
    await expect(this.getStepButton(stepNumber)).toBeVisible();
  }

  async verifyTopicCards(topics: TopicConfig[]): Promise<void> {
    for (const topic of topics) {
      await expect(this.page.getByText(topic.name, { exact: true })).toBeVisible();
      await expect(this.page.getByText(topic.description)).toBeVisible();
    }
  }

  async verifyTopicHeading(topicName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: topicName, level: 3 })).toBeVisible();
  }

  async verifyTopicNamesVisible(topics: TopicConfig[]): Promise<void> {
    for (const topic of topics) {
      await expect(this.page.getByText(topic.name, { exact: true })).toBeVisible();
    }
  }
}
