import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BaseModal {
  readonly cancelButton: Locator;
  readonly modal: Locator;
  protected readonly page: Page;
  readonly saveButton: Locator;

  constructor(page: Page, modalTestId: string) {
    this.page = page;
    this.modal = this.page.getByTestId(modalTestId);
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

  async waitForModalToClose(): Promise<void> {
    await expect(this.modal).not.toBeVisible();
  }

  async waitForModalToOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }
}
