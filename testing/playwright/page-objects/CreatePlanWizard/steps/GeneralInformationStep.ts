import { expect, type Page } from '@playwright/test';

import type { TargetProject } from '../../../types/test-data';
import type { ResourceManager } from '../../../utils/ResourceManager';

export class GeneralInformationStep {
  private readonly page: Page;
  private readonly resourceManager?: ResourceManager;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
  }

  async cancelProjectCreation() {
    await this.page.getByTestId('create-project-modal-cancel-button').click();
    await expect(this.page.getByTestId('project-name-input')).not.toBeVisible();
  }

  async clickCreateProjectInModal() {
    await this.page.getByTestId('create-project-modal-create-button').click();
  }

  async expectProjectCreationError() {
    await expect(this.page.getByTestId('create-project-modal-error-alert')).toBeVisible();
    await expect(this.page.getByTestId('project-name-input')).toBeVisible();
  }

  async fillAndComplete(data: {
    planName: string;
    planProject: string;
    sourceProvider: string;
    targetProvider: string;
    targetProject: TargetProject;
  }): Promise<void> {
    await this.fillPlanName(data.planName);
    await this.selectProject(data.planProject, 'plan-project-select');
    await this.selectSourceProvider(data.sourceProvider);
    await this.selectTargetProvider(data.targetProvider);
    await this.waitForTargetProviderNamespaces();
    await this.selectTargetProject(data.targetProject);
  }

  async fillPlanName(name: string) {
    const nameInput = this.page.getByTestId('plan-name-input');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
  }

  async fillProjectNameInModal(name: string) {
    const nameInput = this.page.getByTestId('project-name-input');
    await nameInput.clear();
    if (name.trim()) {
      await nameInput.fill(name);
    }
  }

  async openCreateProjectModal() {
    await this.page.getByTestId('target-project-select').click();
    await this.page.getByTestId('create-project-button').click();
    await expect(this.page.getByTestId('project-name-input')).toBeVisible();
  }

  async selectProject(projectName: string, testId: string, showDefaultProjects = false) {
    await this.page.getByTestId(testId).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByTestId(testId).getByRole('button').click();
    if (showDefaultProjects) {
      await this.page.locator('label[for="show-default-projects-switch"]').click();
    }

    const searchBox = this.page.getByTestId(testId).getByRole('combobox');
    await searchBox.fill(projectName);

    const option = this.page.getByRole('option', { name: projectName });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
  }

  async selectSourceProvider(providerName: string) {
    const selector = this.page.getByTestId('source-provider-select');
    await selector.waitFor({ state: 'visible', timeout: 10000 });
    await expect(selector).toBeVisible();
    await expect(selector).toBeEnabled();
    await selector.click();

    const option = this.page.getByRole('option', { name: providerName });
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
  }

  async selectTargetProject(targetProject: TargetProject) {
    if (targetProject.isPreexisting) {
      await this.selectProject(targetProject.name, 'target-project-select', true);
    } else {
      await this.page.getByTestId('target-project-select').getByRole('button').click();
      await this.page.getByTestId('create-project-button').click();
      const nameTextbox = this.page.getByTestId('project-name-input');
      await nameTextbox.click();
      await nameTextbox.fill(targetProject.name);
      const displayNameTextbox = this.page.getByTestId('project-display-name-input');
      await displayNameTextbox.fill(targetProject.name);
      await displayNameTextbox.click();
      await this.page.getByTestId('create-project-modal-create-button').click();

      if (this.resourceManager) {
        this.resourceManager.addProject(targetProject.name, true);
      }
    }
  }

  async selectTargetProvider(providerName: string) {
    const selector = this.page.getByTestId('target-provider-select');
    await expect(selector).toBeVisible();
    await expect(selector).toBeEnabled();
    await selector.click();

    const option = this.page.getByRole('option', { name: providerName });
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
  }

  async waitForTargetProviderNamespaces() {
    const targetProjectSelect = this.page.getByTestId('target-project-select');
    await expect(targetProjectSelect).toBeEnabled({ timeout: 15000 });
  }
}
