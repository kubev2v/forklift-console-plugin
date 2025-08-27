import { expect, type Page } from '@playwright/test';

import type { TargetProject } from '../../../types/test-data';

export class GeneralInformationStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillPlanName(name: string) {
    const nameInput = this.page.getByTestId('plan-name-input');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
  }

  async selectProject(projectName: string, testId: string, showDefaultProjects = false) {
    await this.page.getByTestId(testId).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByTestId(testId).getByRole('button').click();
    if (showDefaultProjects) {
      await this.page.locator('label[for="show-default-projects-switch"]').click();
    }
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
    // Ensure the target project select is enabled (indicating namespaces loaded)
    const targetProjectSelect = this.page.getByTestId('target-project-select');
    await expect(targetProjectSelect).toBeEnabled({ timeout: 15000 });
  }
}
