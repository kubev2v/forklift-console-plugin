import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Base class for modal dialogs.
 * Provides common functionality for save, cancel, and modal visibility.
 */
export abstract class BaseModal {
  readonly cancelButton: Locator;
  readonly modal: Locator;
  protected readonly page: Page;
  readonly saveButton: Locator;

  /**
   * @param page - Playwright page object
   * @param modalSelector - Either a data-testid string or a Locator for the modal
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  constructor(page: Page, modalSelector: string | Locator) {
    this.page = page;
    this.modal =
      typeof modalSelector === 'string' ? this.page.getByTestId(modalSelector) : modalSelector;
    this.saveButton = this.page.getByTestId('modal-confirm-button');
    this.cancelButton = this.page.getByTestId('modal-cancel-button');
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForModalToClose();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
    await this.waitForModalToClose();
  }

  async verifySaveButtonDisabled(): Promise<void> {
    await expect(this.saveButton).toBeDisabled();
  }

  async verifySaveButtonEnabled(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
  }

  async waitForModalToClose(): Promise<void> {
    await expect(this.modal).not.toBeVisible();
  }

  async waitForModalToOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }
}
