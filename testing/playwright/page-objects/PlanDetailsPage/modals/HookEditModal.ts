import { expect, type Locator, type Page } from '@playwright/test';

import { BaseModal } from '../../common/BaseModal';

/**
 * Page object for the Hook Edit Modal.
 * Extends BaseModal with hook-specific functionality for configuring
 * pre/post migration hooks with Ansible playbooks.
 */
export class HookEditModal extends BaseModal {
  readonly enableHookCheckbox: Locator;
  readonly hookRunnerImageInput: Locator;
  readonly serviceAccountInput: Locator;

  constructor(page: Page) {
    super(page, page.getByRole('dialog'));
    this.enableHookCheckbox = this.page.getByTestId('hook-enabled-checkbox');
    this.hookRunnerImageInput = this.page.getByTestId('hook-runner-image-input');
    this.serviceAccountInput = this.page.getByTestId('hook-service-account-input');
  }

  async disableHook(): Promise<void> {
    await this.enableHookCheckbox.uncheck();
    await expect(this.enableHookCheckbox).not.toBeChecked();
  }

  async enableHook(): Promise<void> {
    await this.enableHookCheckbox.check();
    await expect(this.enableHookCheckbox).toBeChecked();
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

  async verifyHookIsDisabled(): Promise<void> {
    await expect(this.enableHookCheckbox).not.toBeChecked();
  }

  async verifyHookIsEnabled(): Promise<void> {
    await expect(this.enableHookCheckbox).toBeChecked();
  }
}
