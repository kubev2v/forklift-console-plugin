import { expect, type Page } from '@playwright/test';

export class GeneralInformationStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async selectProjectByTestId(
    testId: string,
    projectName: string,
    showDefaultProjects = false,
  ) {
    await this.page.getByTestId(testId).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByTestId(testId).getByRole('button').click();
    if (showDefaultProjects) {
      await this.page.locator('label[for="show-default-projects-switch"]').click();
    }
    const option = this.page.getByRole('option', { name: projectName });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
  }

  async fillPlanName(name: string) {
    const nameInput = this.page.getByTestId('plan-name-input');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
  }

  async selectPlanProject(projectName: string) {
    await this.selectProjectByTestId('plan-project-select', projectName);
  }

  async selectSourceProvider(providerName: string) {
    const selector = this.page.getByTestId('source-provider-select');
    await expect(selector).toBeVisible();
    await expect(selector).toBeEnabled();
    await selector.click();

    const option = this.page.getByRole('option', { name: providerName });
    await expect(option).toBeVisible();
    await option.click();
  }

  async selectTargetProject(projectName: string) {
    await this.selectProjectByTestId('target-project-select', projectName, true);
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
