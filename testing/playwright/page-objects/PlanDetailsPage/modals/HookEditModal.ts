import { expect, type Locator, type Page } from '@playwright/test';

export class HookEditModal {
  readonly cancelButton: Locator;
  readonly enableHookCheckbox: Locator;
  readonly hookRunnerImageInput: Locator;
  readonly modal: Locator;
  protected readonly page: Page;
  readonly saveButton: Locator;
  readonly serviceAccountInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = this.page.getByRole('dialog');
    this.enableHookCheckbox = this.page.getByTestId('hook-enabled-checkbox');
    this.hookRunnerImageInput = this.page.getByTestId('hook-runner-image-input');
    this.serviceAccountInput = this.page.getByTestId('hook-service-account-input');
    this.saveButton = this.page.getByTestId('modal-confirm-button');
    this.cancelButton = this.page.getByTestId('modal-cancel-button');
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForModalToClose();
  }

  async disableHook(): Promise<void> {
    await this.enableHookCheckbox.uncheck();
    await expect(this.enableHookCheckbox).not.toBeChecked();
  }

  async enableHook(): Promise<void> {
    await this.enableHookCheckbox.check();
    await expect(this.enableHookCheckbox).toBeChecked();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
    await this.waitForModalToClose();
  }

  async setAnsiblePlaybook(playbook: string): Promise<void> {
    await this.page.evaluate((yamlContent) => {
      const monacoInstance = (globalThis as any).monaco?.editor?.getModels?.()?.[0];
      if (monacoInstance) {
        monacoInstance.setValue(yamlContent);
      } else {
        const editors = (globalThis as any).monaco?.editor?.getEditors?.();
        if (editors && Array.isArray(editors) && editors.length > 0) {
          editors[0].setValue(yamlContent);
        }
      }
    }, playbook);
  }

  async setHookRunnerImage(image: string): Promise<void> {
    await this.hookRunnerImageInput.clear();
    await this.hookRunnerImageInput.fill(image);
  }

  async setServiceAccount(serviceAccount: string): Promise<void> {
    await this.serviceAccountInput.clear();
    await this.serviceAccountInput.fill(serviceAccount);
  }

  async verifyHookEnabled(enabled: boolean): Promise<void> {
    if (enabled) {
      await expect(this.enableHookCheckbox).toBeChecked();
    } else {
      await expect(this.enableHookCheckbox).not.toBeChecked();
    }
  }

  async waitForModalToClose(): Promise<void> {
    await expect(this.modal).not.toBeVisible();
  }

  async waitForModalToOpen(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }
}
