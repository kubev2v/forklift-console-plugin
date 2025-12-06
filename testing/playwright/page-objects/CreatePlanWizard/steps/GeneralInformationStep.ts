import { expect, type Page } from '@playwright/test';

import type { PlanTestData, TargetProject } from '../../../types/test-data';
import type { ResourceManager } from '../../../utils/resource-manager/ResourceManager';

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

  async fillAndComplete(testData: PlanTestData): Promise<void> {
    await this.fillPlanName(testData.planName);
    await this.selectProject(testData.planProject, 'plan-project-select');
    if (testData.description) {
      await this.fillDescription(testData.description);
    }
    await this.selectSourceProvider(testData.sourceProvider);
    await this.selectTargetProvider(testData.targetProvider);
    await this.waitForTargetProviderNamespaces();
    await this.selectTargetProject(testData.targetProject);
  }

  async fillDescription(description: string) {
    const descriptionInput = this.page.getByTestId('plan-description-input');
    await expect(descriptionInput).toBeVisible();
    await descriptionInput.fill(description);
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
      const switchElement = this.page.locator('#show-default-projects-switch');
      const isChecked = await switchElement.isChecked();

      if (!isChecked) {
        await this.page.locator('label[for="show-default-projects-switch"]').click();
      }
    }

    const searchBox = this.page.getByTestId(testId).getByRole('combobox');
    await searchBox.fill(projectName);

    const option = this.page.getByRole('option', { name: projectName });
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  async selectSourceProvider(providerName: string) {
    const selector = this.page.getByTestId('source-provider-select');
    await selector.waitFor({ state: 'visible' });
    await expect(selector).toBeVisible();
    await expect(selector).toBeEnabled();
    await selector.click();

    const option = this.page.getByRole('option', { name: providerName });
    await expect(option).toBeVisible();
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
    await expect(option).toBeVisible();
    await option.click();
  }

  async waitForTargetProviderNamespaces() {
    const targetProjectSelect = this.page.getByTestId('target-project-select');
    await expect(targetProjectSelect).toBeEnabled();
  }
}
