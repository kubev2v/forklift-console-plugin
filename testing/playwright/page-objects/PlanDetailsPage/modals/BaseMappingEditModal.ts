/* eslint-disable perfectionist/sort-classes */
import { expect, type Locator, type Page } from '@playwright/test';

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
export abstract class BaseMappingEditModal {
  protected abstract readonly config: MappingModalConfig;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private addMappingButtonLocator(): Locator {
    return this.modalLocator().getByTestId('add-mapping-button');
  }

  private cancelButtonLocator(): Locator {
    return this.page.getByTestId('modal-cancel-button');
  }

  private saveButtonLocator(): Locator {
    return this.page.getByTestId('modal-confirm-button');
  }

  async addMapping(): Promise<number> {
    const countBefore = await this.getMappingCount();
    await this.addMappingButtonLocator().click();
    await this.mappingRowLocator(countBefore).waitFor({ state: 'visible' });
    return countBefore;
  }

  get addMappingButton(): Locator {
    return this.addMappingButtonLocator();
  }

  async cancel(): Promise<void> {
    await this.cancelButtonLocator().click();
    await this.waitForModalToClose();
  }

  get cancelButton(): Locator {
    return this.cancelButtonLocator();
  }

  async getMappingCount(): Promise<number> {
    return await this.modalLocator().locator('[data-testid^="field-row-"]').count();
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

  get modal(): Locator {
    return this.modalLocator();
  }

  async removeMapping(index: number): Promise<void> {
    const countBefore = await this.getMappingCount();
    await this.removeButtonLocator(index).click();
    await expect(this.modalLocator().locator('[data-testid^="field-row-"]')).toHaveCount(
      countBefore - 1,
    );
  }

  async save(): Promise<void> {
    await expect(this.saveButtonLocator()).toBeEnabled();
    await this.saveButtonLocator().click();
    await this.waitForModalToClose();
    // Wait for backend to process the change
    await this.page.waitForTimeout(500);
  }

  get saveButton(): Locator {
    return this.saveButtonLocator();
  }

  async selectSourceAtIndex(index: number, sourceValue: string): Promise<void> {
    const sourceSelect = this.sourceSelectLocator(index);
    const trimmedSource = sourceValue.trim();

    // Wait for the select button to be ready
    await expect(sourceSelect).toBeVisible();
    await expect(sourceSelect).toBeEnabled();

    // Click to open dropdown
    await sourceSelect.click();

    // Wait for dropdown to open (check aria-expanded attribute)
    await expect(sourceSelect).toHaveAttribute('aria-expanded', 'true');

    // Find and click the option with exact match
    const option = this.page.getByRole('option', { name: trimmedSource, exact: true });
    await option.click();
  }

  async selectTargetAtIndex(index: number, targetValue: string): Promise<void> {
    const targetSelect = this.targetSelectLocator(index);
    const trimmedTarget = targetValue.trim();

    // Wait for the select button to be ready
    await expect(targetSelect).toBeVisible();
    await expect(targetSelect).toBeEnabled();

    // Click to open dropdown
    await targetSelect.click();

    // Wait for dropdown to open (check aria-expanded attribute)
    await expect(targetSelect).toHaveAttribute('aria-expanded', 'true');

    // Find and click the option with exact match
    const option = this.page.getByRole('option', { name: trimmedTarget, exact: true });
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
    await expect(this.addMappingButtonLocator()).toBeVisible();
    await expect(this.cancelButtonLocator()).toBeVisible();
  }

  async verifyModalTitle(): Promise<void> {
    await expect(
      this.modalLocator().getByRole('heading', { name: this.config.modalTitle }),
    ).toBeVisible();
  }

  async verifySaveButtonDisabled(): Promise<void> {
    await expect(this.saveButtonLocator()).toBeDisabled();
  }

  async verifySaveButtonEnabled(): Promise<void> {
    await expect(this.saveButtonLocator()).toBeEnabled();
  }

  async waitForModalToClose(): Promise<void> {
    await expect(this.modalLocator()).not.toBeVisible();
  }

  async waitForModalToOpen(): Promise<void> {
    await expect(this.modalLocator()).toBeVisible();
  }

  protected mappingRowLocator(index: number): Locator {
    return this.modalLocator().getByTestId(`field-row-${index}`);
  }

  protected modalLocator(): Locator {
    return this.page.getByTestId(this.config.modalTestId);
  }

  protected removeButtonLocator(index: number): Locator {
    return this.mappingRowLocator(index).locator('button[class*="plain"]');
  }

  protected sourceSelectLocator(index: number): Locator {
    return this.modalLocator().getByTestId(this.config.sourceTestIdPattern(index));
  }

  protected targetSelectLocator(index: number): Locator {
    return this.modalLocator().getByTestId(this.config.targetTestIdPattern(index));
  }
}
