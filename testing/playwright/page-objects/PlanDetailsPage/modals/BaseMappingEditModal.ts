/* eslint-disable perfectionist/sort-classes */
import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

/**
 * Configuration for a mapping edit modal.
 */
export interface MappingModalConfig {
  /** The data-testid for the modal container */
  modalTestId: string;
  /** The modal title text (e.g., 'Edit network map') */
  modalTitle: string;
  /** Function to generate the source select data-testid for a given index */
  sourceTestIdPattern: (index: number) => string;
  /** Function to generate the target select data-testid for a given index */
  targetTestIdPattern: (index: number) => string;
}

/**
 * Base class for mapping edit modals (Network and Storage).
 * Contains all shared functionality for interacting with mapping edit dialogs.
 */
export abstract class BaseMappingEditModal extends BaseModal {
  readonly addMappingButton: Locator;
  protected abstract readonly config: MappingModalConfig;

  constructor(page: Page, modalTestId: string) {
    super(page, modalTestId);
    this.addMappingButton = this.modal.getByTestId('add-mapping-button');
  }

  async addMapping(): Promise<number> {
    const countBefore = await this.getMappingCount();
    await this.addMappingButton.click();
    await this.mappingRowLocator(countBefore).waitFor({ state: 'visible' });
    return countBefore;
  }

  async getMappingCount(): Promise<number> {
    return await this.modal.locator('[data-testid^="field-row-"]').count();
  }

  async getSourceAtIndex(index: number): Promise<string> {
    const sourceSelect = this.sourceSelectLocator(index);
    const text = (await sourceSelect.textContent()) ?? '';
    return text.trim();
  }

  async getTargetAtIndex(index: number): Promise<string> {
    const targetSelect = this.targetSelectLocator(index);
    const text = (await targetSelect.textContent()) ?? '';
    return text.trim();
  }

  async removeMapping(index: number): Promise<void> {
    const countBefore = await this.getMappingCount();
    await this.removeButtonLocator(index).click();
    await expect(this.modal.locator('[data-testid^="field-row-"]')).toHaveCount(countBefore - 1);
  }

  override async save(): Promise<void> {
    await super.save();
    // Wait for K8s watch to propagate the change to React state
    // The modal fetches data via useK8sWatchResource which needs time to update
    await this.page.waitForTimeout(500);
  }

  async selectDifferentTargetAtIndex(index: number): Promise<string> {
    const currentTarget = await this.getTargetAtIndex(index);
    const targetSelect = this.targetSelectLocator(index);

    await expect(targetSelect).toBeVisible();
    await targetSelect.click();
    await expect(targetSelect).toHaveAttribute('aria-expanded', 'true');

    const option = this.page.locator('[role="option"]:enabled').nth(1);
    await expect(option).toBeVisible();
    const newValue = (await option.textContent()) ?? '';
    await option.click();

    expect(newValue.trim()).not.toBe(currentTarget);
    return newValue.trim();
  }

  async selectFirstAvailableSourceAtIndex(index: number): Promise<string> {
    const sourceSelect = this.sourceSelectLocator(index);
    await expect(sourceSelect).toBeVisible();
    await sourceSelect.click();
    await expect(sourceSelect).toHaveAttribute('aria-expanded', 'true');

    const option = this.page.locator('[role="option"]:enabled').first();
    await expect(option).toBeVisible();
    const selectedValue = (await option.textContent()) ?? '';
    await option.click();
    return selectedValue.trim();
  }

  async selectFirstAvailableTargetAtIndex(index: number): Promise<string> {
    const targetSelect = this.targetSelectLocator(index);
    await expect(targetSelect).toBeVisible();
    await targetSelect.click();
    await expect(targetSelect).toHaveAttribute('aria-expanded', 'true');

    const option = this.page.locator('[role="option"]:enabled').first();
    await expect(option).toBeVisible();
    const selectedValue = (await option.textContent()) ?? '';
    await option.click();
    return selectedValue.trim();
  }

  async selectSourceAtIndex(index: number, sourceValue: string): Promise<void> {
    const sourceSelect = this.sourceSelectLocator(index);
    const trimmedSource = sourceValue.trim();

    await expect(sourceSelect).toBeVisible();
    await expect(sourceSelect).toBeEnabled();
    await sourceSelect.click();
    await expect(sourceSelect).toHaveAttribute('aria-expanded', 'true');

    const option = this.page
      .locator('.pf-v5-c-menu__list-item, .pf-v6-c-menu__list-item, [role="option"]')
      .filter({ hasText: trimmedSource })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }

  async selectTargetAtIndex(index: number, targetValue: string): Promise<void> {
    const targetSelect = this.targetSelectLocator(index);
    const trimmedTarget = targetValue.trim();

    await expect(targetSelect).toBeVisible();
    await expect(targetSelect).toBeEnabled();
    await targetSelect.click();
    await expect(targetSelect).toHaveAttribute('aria-expanded', 'true');

    const option = this.page
      .locator('.pf-v5-c-menu__list-item, .pf-v6-c-menu__list-item, [role="option"]')
      .filter({ hasText: trimmedTarget })
      .first();
    await expect(option).toBeVisible();
    await option.click();
  }

  async verifyMappingAtIndex(
    index: number,
    expectedSource: string,
    expectedTarget: string,
  ): Promise<void> {
    const row = this.mappingRowLocator(index);
    const sourceButton = row.locator('button').first();
    const targetSelect = this.targetSelectLocator(index);

    await expect(sourceButton).toContainText(expectedSource);
    await expect(targetSelect).toContainText(expectedTarget);
  }

  async verifyModalStructure(): Promise<void> {
    await this.verifyModalTitle();
    await expect(this.addMappingButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  async verifyModalTitle(): Promise<void> {
    await expect(this.modal.getByRole('heading', { name: this.config.modalTitle })).toBeVisible();
  }

  protected mappingRowLocator(index: number): Locator {
    return this.modal.getByTestId(`field-row-${index}`);
  }

  protected removeButtonLocator(index: number): Locator {
    return this.mappingRowLocator(index).locator('button[class*="plain"]');
  }

  protected sourceSelectLocator(index: number): Locator {
    return this.modal.getByTestId(this.config.sourceTestIdPattern(index));
  }

  protected targetSelectLocator(index: number): Locator {
    return this.modal.getByTestId(this.config.targetTestIdPattern(index));
  }
}
