import type { Page } from '@playwright/test';

export class GeneralInformationStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async selectProjectByTestId(testId: string, projectName: string) {
    await this.page.getByTestId(testId).click();
    await this.page.getByRole('option', { name: projectName }).click();
  }

  async fillPlanName(name: string) {
    await this.page.getByTestId('plan-name-input').fill(name);
  }

  async selectPlanProject(projectName: string) {
    await this.selectProjectByTestId('plan-project-select', projectName);
  }

  async selectSourceProvider(providerName: string) {
    await this.page.getByTestId('source-provider-select').click();
    await this.page.getByRole('option', { name: providerName }).click();
  }

  async selectTargetProject(projectName: string) {
    await this.selectProjectByTestId('target-project-select', projectName);
  }

  async selectTargetProvider(providerName: string) {
    await this.page.getByTestId('target-provider-select').click();
    await this.page.getByRole('option', { name: providerName }).click();
  }

  async waitForTargetProviderNamespaces() {
    await this.page.waitForResponse('**/forklift-inventory/providers/openshift/*/namespaces');
  }
}
