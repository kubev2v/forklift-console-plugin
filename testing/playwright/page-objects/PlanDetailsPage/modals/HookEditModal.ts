import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

export class HookEditModal extends BaseModal {
  readonly hookRunnerImageInput: Locator;
  readonly serviceAccountInput: Locator;
  readonly sourceAapRadio: Locator;
  readonly sourceLocalRadio: Locator;
  readonly sourceNoneRadio: Locator;

  constructor(page: Page) {
    super(page, page.getByRole('dialog'));
    this.sourceAapRadio = this.page.getByTestId('hook-edit-source-aap');
    this.sourceNoneRadio = this.page.getByTestId('hook-edit-source-none');
    this.sourceLocalRadio = this.page.getByTestId('hook-edit-source-local');
    this.hookRunnerImageInput = this.page.getByTestId('hook-runner-image-input');
    this.serviceAccountInput = this.page.getByTestId('hook-service-account-input');
  }

  async disableHook(): Promise<void> {
    await this.sourceNoneRadio.click();
    await expect(this.sourceNoneRadio).toBeChecked();
  }

  async enableHook(): Promise<void> {
    await this.sourceLocalRadio.click();
    await expect(this.sourceLocalRadio).toBeChecked();
  }

  async selectAap(): Promise<void> {
    await this.sourceAapRadio.click();
    await expect(this.sourceAapRadio).toBeChecked();
  }

  async setAnsiblePlaybook(playbook: string): Promise<void> {
    const success = await this.page.evaluate((yamlContent) => {
      const monacoInstance = (globalThis as any).monaco?.editor?.getModels?.()?.[0];
      if (monacoInstance) {
        monacoInstance.setValue(yamlContent);
        return true;
      }
      const editors = (globalThis as any).monaco?.editor?.getEditors?.();
      if (editors && Array.isArray(editors) && editors.length > 0) {
        editors[0].setValue(yamlContent);
        return true;
      }
      return false;
    }, playbook);

    if (!success) {
      throw new Error('Failed to set playbook content - Monaco editor not found');
    }
  }

  async setHookRunnerImage(image: string): Promise<void> {
    await this.hookRunnerImageInput.clear();
    await this.hookRunnerImageInput.fill(image);
  }

  async setServiceAccount(serviceAccount: string): Promise<void> {
    await this.serviceAccountInput.clear();
    await this.serviceAccountInput.fill(serviceAccount);
  }

  async verifyAapNotConfiguredAlert(): Promise<void> {
    await expect(this.page.getByRole('dialog').getByText('AAP is not configured')).toBeVisible();
  }

  async verifyAapRadioVisible(): Promise<void> {
    await expect(this.sourceAapRadio).toBeVisible();
  }

  async verifyHookIsDisabled(): Promise<void> {
    await expect(this.sourceNoneRadio).toBeChecked();
  }

  async verifyHookIsEnabled(): Promise<void> {
    await expect(this.sourceLocalRadio).toBeChecked();
  }

  async verifyLocalFieldsHidden(): Promise<void> {
    await expect(this.hookRunnerImageInput).not.toBeVisible();
    await expect(this.serviceAccountInput).not.toBeVisible();
  }

  async verifyLocalFieldsVisible(): Promise<void> {
    await expect(this.hookRunnerImageInput).toBeVisible();
    await expect(this.serviceAccountInput).toBeVisible();
  }
}
