import { expect, type Page } from '@playwright/test';

export class GeneralInformationStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async selectProjectByTestId(testId: string, projectName: string) {
    // Use data-testid selectors (QA-appropriate approach)
    await this.page.getByTestId(testId).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByTestId(testId).click();

    // Wait for the dropdown to load options (API call to complete)
    // This is critical for target project which loads from API
    await this.page.waitForTimeout(1000); // Give API call time to start

    // Wait for the specific option to appear before trying to click it
    const option = this.page.getByRole('option', { name: projectName });
    await option.waitFor({ state: 'visible', timeout: 15000 }); // Extended timeout for API call
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
    await this.selectProjectByTestId('target-project-select', projectName);
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
    // Wait for the target provider namespaces API call to complete
    // This should be called after selecting a target provider
    await this.page.waitForTimeout(2000);

    // Ensure the target project select is enabled (indicating namespaces loaded)
    const targetProjectSelect = this.page.getByTestId('target-project-select');
    await expect(targetProjectSelect).toBeEnabled({ timeout: 15000 });
  }
}
