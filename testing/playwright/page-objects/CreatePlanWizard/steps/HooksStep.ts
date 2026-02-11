import { expect, type Locator, type Page } from '@playwright/test';

export interface HookConfig {
  enabled: boolean;
  hookRunnerImage?: string;
  serviceAccount?: string;
  ansiblePlaybook?: string;
}

export class HooksStep {
  protected readonly page: Page;
  readonly postMigrationCheckbox: Locator;
  readonly postMigrationHookRunnerImageInput: Locator;
  readonly postMigrationServiceAccountInput: Locator;
  readonly preMigrationCheckbox: Locator;
  readonly preMigrationHookRunnerImageInput: Locator;
  readonly preMigrationServiceAccountInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.preMigrationCheckbox = this.page.getByTestId('preMigrationHook.enableHook-checkbox');
    this.preMigrationHookRunnerImageInput = this.page.getByTestId(
      'preMigrationHook.runnerImage-input',
    );
    this.preMigrationServiceAccountInput = this.page.getByTestId(
      'preMigrationHook.serviceAccount-input',
    );
    this.postMigrationCheckbox = this.page.getByTestId('postMigrationHook.enableHook-checkbox');
    this.postMigrationHookRunnerImageInput = this.page.getByTestId(
      'postMigrationHook.runnerImage-input',
    );
    this.postMigrationServiceAccountInput = this.page.getByTestId(
      'postMigrationHook.serviceAccount-input',
    );
  }

  async configurePostMigrationHook(config: HookConfig): Promise<void> {
    if (config.enabled) {
      await this.enablePostMigrationHook();

      if (config.hookRunnerImage) {
        await this.postMigrationHookRunnerImageInput.fill(config.hookRunnerImage);
      }

      if (config.serviceAccount) {
        await this.postMigrationServiceAccountInput.fill(config.serviceAccount);
      }

      if (config.ansiblePlaybook) {
        await this.fillYamlEditorContent(config.ansiblePlaybook, 1);
      }
    } else {
      await this.disablePostMigrationHook();
    }
  }

  async configurePreMigrationHook(config: HookConfig): Promise<void> {
    if (config.enabled) {
      await this.enablePreMigrationHook();

      if (config.hookRunnerImage) {
        await this.preMigrationHookRunnerImageInput.fill(config.hookRunnerImage);
      }

      if (config.serviceAccount) {
        await this.preMigrationServiceAccountInput.fill(config.serviceAccount);
      }

      if (config.ansiblePlaybook) {
        await this.fillYamlEditorContent(config.ansiblePlaybook, 0);
      }
    } else {
      await this.disablePreMigrationHook();
    }
  }

  async disablePostMigrationHook(): Promise<void> {
    await this.postMigrationCheckbox.uncheck();
    await expect(this.postMigrationCheckbox).not.toBeChecked();
  }

  async disablePreMigrationHook(): Promise<void> {
    await this.preMigrationCheckbox.uncheck();
    await expect(this.preMigrationCheckbox).not.toBeChecked();
  }

  async enablePostMigrationHook(): Promise<void> {
    await this.postMigrationCheckbox.check();
    await expect(this.postMigrationCheckbox).toBeChecked();
  }

  async enablePreMigrationHook(): Promise<void> {
    await this.preMigrationCheckbox.check();
    await expect(this.preMigrationCheckbox).toBeChecked();
  }

  async fillAndComplete(
    preMigrationHook?: HookConfig,
    postMigrationHook?: HookConfig,
  ): Promise<void> {
    await this.verifyStepVisible();

    if (preMigrationHook) {
      await this.configurePreMigrationHook(preMigrationHook);
    }

    if (postMigrationHook) {
      await this.configurePostMigrationHook(postMigrationHook);
    }
  }

  async fillYamlEditorContent(content: string, editorIndex = 0): Promise<void> {
    await this.page.evaluate(
      ({ yamlContent, index }) => {
        const editors = (globalThis as any).monaco?.editor?.getEditors?.();
        if (editors && Array.isArray(editors) && editors.length > index) {
          editors[index].setValue(yamlContent);
        }
      },
      { yamlContent: content, index: editorIndex },
    );
  }

  async verifyPostMigrationHookDisabled(): Promise<void> {
    await expect(this.postMigrationCheckbox).not.toBeChecked();
    await expect(this.postMigrationHookRunnerImageInput).not.toBeVisible();
  }

  async verifyPostMigrationHookEnabled(): Promise<void> {
    await expect(this.postMigrationCheckbox).toBeChecked();
    await expect(this.postMigrationHookRunnerImageInput).toBeVisible();
    await expect(this.postMigrationServiceAccountInput).toBeVisible();
  }

  async verifyPreMigrationHookDisabled(): Promise<void> {
    await expect(this.preMigrationCheckbox).not.toBeChecked();
    await expect(this.preMigrationHookRunnerImageInput).not.toBeVisible();
  }

  async verifyPreMigrationHookEnabled(): Promise<void> {
    await expect(this.preMigrationCheckbox).toBeChecked();
    await expect(this.preMigrationHookRunnerImageInput).toBeVisible();
    await expect(this.preMigrationServiceAccountInput).toBeVisible();
  }

  async verifyStepVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Hooks (optional)' })).toBeVisible();
    await expect(this.page.getByText('Pre migration hook', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Post migration hook', { exact: true })).toBeVisible();
  }
}
