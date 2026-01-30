import { expect, type Locator, type Page } from '@playwright/test';

import { disableGuidedTour } from '../../../utils/utils';
import { HookEditModal } from '../modals/HookEditModal';

export class HooksTab {
  readonly hookEditModal: HookEditModal;
  readonly hooksTabLink: Locator;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.hooksTabLink = this.page.locator('[data-test-id="horizontal-link-Hooks"]');
    this.hookEditModal = new HookEditModal(page);
  }

  async editPostMigrationHook(config: {
    enabled: boolean;
    hookRunnerImage?: string;
    serviceAccount?: string;
    ansiblePlaybook?: string;
  }): Promise<void> {
    await this.openPostMigrationHookEditModal();

    if (config.enabled) {
      await this.hookEditModal.enableHook();
      if (config.hookRunnerImage) {
        await this.hookEditModal.setHookRunnerImage(config.hookRunnerImage);
      }
      if (config.serviceAccount) {
        await this.hookEditModal.setServiceAccount(config.serviceAccount);
      }
      if (config.ansiblePlaybook) {
        await this.hookEditModal.setAnsiblePlaybook(config.ansiblePlaybook);
      }
    } else {
      await this.hookEditModal.disableHook();
    }

    await this.hookEditModal.save();
  }

  async editPreMigrationHook(config: {
    enabled: boolean;
    hookRunnerImage?: string;
    serviceAccount?: string;
    ansiblePlaybook?: string;
  }): Promise<void> {
    await this.openPreMigrationHookEditModal();

    if (config.enabled) {
      await this.hookEditModal.enableHook();
      if (config.hookRunnerImage) {
        await this.hookEditModal.setHookRunnerImage(config.hookRunnerImage);
      }
      if (config.serviceAccount) {
        await this.hookEditModal.setServiceAccount(config.serviceAccount);
      }
      if (config.ansiblePlaybook) {
        await this.hookEditModal.setAnsiblePlaybook(config.ansiblePlaybook);
      }
    } else {
      await this.hookEditModal.disableHook();
    }

    await this.hookEditModal.save();
  }

  async navigateToHooksTab(): Promise<void> {
    await disableGuidedTour(this.page);
    await this.hooksTabLink.click();
    await expect(this.page.getByTestId('hook-enabled-detail-item').first()).toBeVisible();
  }

  async openPostMigrationHookEditModal(): Promise<void> {
    await this.page.getByTestId('PostHook-hook-edit-button').click();
    await this.hookEditModal.waitForModalToOpen();
  }

  async openPreMigrationHookEditModal(): Promise<void> {
    await this.page.getByTestId('PreHook-hook-edit-button').click();
    await this.hookEditModal.waitForModalToOpen();
  }

  async removePostMigrationHook(): Promise<void> {
    await this.openPostMigrationHookEditModal();
    await this.hookEditModal.disableHook();
    await this.hookEditModal.save();
  }

  async removePreMigrationHook(): Promise<void> {
    await this.openPreMigrationHookEditModal();
    await this.hookEditModal.disableHook();
    await this.hookEditModal.save();
  }

  async verifyHookRunnerImage(hookType: 'pre' | 'post', expectedImage: string): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const runnerImageItem = this.page.getByTestId('hook-runner-image-detail-item').nth(index);
    await expect(runnerImageItem).toContainText(expectedImage);
  }

  async verifyHooksTabVisible(): Promise<void> {
    await expect(this.hooksTabLink).toBeVisible();
  }

  async verifyPlaybookContent(hookType: 'pre' | 'post', expectedContent: string): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const playbookItem = this.page.getByTestId('playbook-detail-item').nth(index);
    await expect(playbookItem).toContainText(expectedContent);
  }

  async verifyPostMigrationHookEnabled(enabled: boolean): Promise<void> {
    const enabledDetailItem = this.page.getByTestId('hook-enabled-detail-item').nth(1);
    await expect(enabledDetailItem).toContainText(enabled ? 'True' : 'False');
  }

  async verifyPreMigrationHookEnabled(enabled: boolean): Promise<void> {
    const enabledDetailItem = this.page.getByTestId('hook-enabled-detail-item').first();
    await expect(enabledDetailItem).toContainText(enabled ? 'True' : 'False');
  }

  async verifyServiceAccount(hookType: 'pre' | 'post', expectedAccount: string): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const serviceAccountItem = this.page.getByTestId('service-account-detail-item').nth(index);
    await expect(serviceAccountItem).toContainText(expectedAccount);
  }
}
