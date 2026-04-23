import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

const FORM_SETTLE_MS = 500;

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

  private async expandAndSelectNth(selectLocator: Locator, nth: number): Promise<void> {
    await expect(selectLocator).toBeVisible();
    await expect(selectLocator).toBeEnabled();
    await this.page.waitForTimeout(FORM_SETTLE_MS);
    await selectLocator.click();
    await expect(selectLocator).toHaveAttribute('aria-expanded', 'true');
    const listbox = this.page.locator('[role="listbox"]:visible').last();
    await expect(listbox).toBeVisible();
    const option = listbox.locator('[role="option"]:enabled').nth(nth);
    await expect(option).toBeVisible();
    await option.click();
  }

  private async selectFromDropdown(selectLocator: Locator, optionText: string): Promise<void> {
    await expect(selectLocator).toBeVisible();
    await expect(selectLocator).toBeEnabled();
    await this.page.waitForTimeout(FORM_SETTLE_MS);
    await selectLocator.click();
    await expect(selectLocator).toHaveAttribute('aria-expanded', 'true');
    const listbox = this.page.locator('[role="listbox"]:visible').last();
    await expect(listbox).toBeVisible();
    const option = listbox.getByRole('option', { name: optionText, exact: true }).first();
    await expect(option).toBeVisible();
    await option.click();
  }

  async addMapping(): Promise<number> {
    const countBefore = await this.getMappingCount();
    await this.addMappingButton.click();
    await this.mappingRowLocator(countBefore).waitFor({ state: 'visible' });
    return countBefore;
  }

  async getMappingCount(): Promise<number> {
    await expect(this.modal).toBeVisible();

    const rows = this.modal.locator('[data-testid^="field-row-"]');
    const firstRow = rows.first();

    try {
      await firstRow.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      return 0;
    }

    return rows.count();
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

  protected mappingRowLocator(index: number): Locator {
    return this.modal.getByTestId(`field-row-${index}`);
  }

  protected removeButtonLocator(index: number): Locator {
    return this.mappingRowLocator(index).locator('button[class*="plain"]');
  }

  async removeMapping(index: number): Promise<void> {
    const countBefore = await this.getMappingCount();
    await this.removeButtonLocator(index).click();
    await expect(this.modal.locator('[data-testid^="field-row-"]')).toHaveCount(countBefore - 1);
  }

  override async save(): Promise<void> {
    await super.save();
    // K8s watch must deliver the updated resource before the modal can be
    // reopened with fresh data. No user-visible signal marks this completion.
    await this.page.waitForTimeout(2000);
  }

  async selectDifferentTargetAtIndex(index: number): Promise<string> {
    const currentTarget = await this.getTargetAtIndex(index);
    const targetSelect = this.targetSelectLocator(index);
    await this.expandAndSelectNth(targetSelect, 1);
    const newValue = await this.getTargetAtIndex(index);
    expect(newValue).not.toBe(currentTarget);
    return newValue;
  }

  async selectFirstAvailableSourceAtIndex(index: number): Promise<string> {
    await this.expandAndSelectNth(this.sourceSelectLocator(index), 0);
    return this.getSourceAtIndex(index);
  }

  async selectFirstAvailableTargetAtIndex(index: number): Promise<string> {
    await this.expandAndSelectNth(this.targetSelectLocator(index), 0);
    return this.getTargetAtIndex(index);
  }

  async selectSourceAtIndex(index: number, sourceValue: string): Promise<void> {
    await this.selectFromDropdown(this.sourceSelectLocator(index), sourceValue.trim());
  }

  async selectTargetAtIndex(index: number, targetValue: string): Promise<void> {
    await this.selectFromDropdown(this.targetSelectLocator(index), targetValue.trim());
  }

  protected sourceSelectLocator(index: number): Locator {
    return this.modal.getByTestId(this.config.sourceTestIdPattern(index));
  }

  protected targetSelectLocator(index: number): Locator {
    return this.modal.getByTestId(this.config.targetTestIdPattern(index));
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
}
