import { expect, type Locator, type Page } from '@playwright/test';

import { disableGuidedTour } from '../../../utils/utils';
import { HookEditModal } from '../modals/HookEditModal';

export type HookType = 'pre' | 'post';

export interface HookConfig {
  enabled: boolean;
  hookRunnerImage?: string;
  serviceAccount?: string;
  ansiblePlaybook?: string;
}

export class HooksTab {
  readonly hookEditModal: HookEditModal;
  readonly hooksTabLink: Locator;
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.hooksTabLink = this.page.locator('[data-test-id="horizontal-link-Hooks"]');
    this.hookEditModal = new HookEditModal(page);
  }

  /**
   * Edit a migration hook (pre or post) with the given configuration.
   */
  async editHook(hookType: HookType, config: HookConfig): Promise<void> {
    await this.openHookEditModal(hookType);

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

  async editPostMigrationHook(config: HookConfig): Promise<void> {
    await this.editHook('post', config);
  }

  async editPreMigrationHook(config: HookConfig): Promise<void> {
    await this.editHook('pre', config);
  }

  async navigateToHooksTab(): Promise<void> {
    await disableGuidedTour(this.page);
    await this.hooksTabLink.click();
    await expect(this.page.getByTestId('hook-enabled-detail-item').first()).toBeVisible();
  }

  /**
   * Open the edit modal for the specified hook type.
   */
  async openHookEditModal(hookType: HookType): Promise<void> {
    const testId = hookType === 'pre' ? 'PreHook-hook-edit-button' : 'PostHook-hook-edit-button';
    await this.page.getByTestId(testId).click();
    await this.hookEditModal.waitForModalToOpen();
  }

  async openPostMigrationHookEditModal(): Promise<void> {
    await this.openHookEditModal('post');
  }

  async openPreMigrationHookEditModal(): Promise<void> {
    await this.openHookEditModal('pre');
  }

  /**
   * Remove a migration hook by disabling it.
   */
  async removeHook(hookType: HookType): Promise<void> {
    await this.openHookEditModal(hookType);
    await this.hookEditModal.disableHook();
    await this.hookEditModal.save();
  }

  async removePostMigrationHook(): Promise<void> {
    await this.removeHook('post');
  }

  async removePreMigrationHook(): Promise<void> {
    await this.removeHook('pre');
  }

  /**
   * Verify that a hook is enabled or disabled.
   */
  async verifyHookEnabled(hookType: HookType, enabled: boolean): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const enabledDetailItem = this.page.getByTestId('hook-enabled-detail-item').nth(index);
    await expect(enabledDetailItem).toContainText(enabled ? 'True' : 'False');
  }

  async verifyHookRunnerImage(hookType: HookType, expectedImage: string): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const runnerImageItem = this.page.getByTestId('hook-runner-image-detail-item').nth(index);
    await expect(runnerImageItem).toContainText(expectedImage);
  }

  async verifyHooksTabVisible(): Promise<void> {
    await expect(this.hooksTabLink).toBeVisible();
  }

  async verifyPlaybookContent(hookType: HookType, expectedContent: string): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const playbookItem = this.page.getByTestId('playbook-detail-item').nth(index);
    await expect(playbookItem).toContainText(expectedContent);
  }

  async verifyPostMigrationHookEnabled(enabled: boolean): Promise<void> {
    await this.verifyHookEnabled('post', enabled);
  }

  async verifyPreMigrationHookEnabled(enabled: boolean): Promise<void> {
    await this.verifyHookEnabled('pre', enabled);
  }

  async verifyServiceAccount(hookType: HookType, expectedAccount: string): Promise<void> {
    const index = hookType === 'pre' ? 0 : 1;
    const serviceAccountItem = this.page.getByTestId('service-account-detail-item').nth(index);
    await expect(serviceAccountItem).toContainText(expectedAccount);
  }
}
