import { expect, type Page } from '@playwright/test';

import { API_ENDPOINTS } from '../../../fixtures/test-data';

export class GeneralInformationStep {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async selectProjectByTestId(testId: string, projectName: string) {
    // Use data-testid selectors (QA-appropriate approach)
    await this.page.getByTestId(testId).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByTestId(testId).click();

    // Select option by role instead of text to avoid localization issues
    await this.page.getByRole('option', { name: projectName }).click();

    // this.page.pause()
    // // Use accessible elements based on the actual page structure
    // if (testId === 'plan-project-select') {
    //   // For plan project, look for the combobox in the "Plan information" group
    //   const planInfoGroup = this.page.getByRole('group', { name: 'Plan information' });
    //   const combobox = planInfoGroup.getByRole('combobox');
    //   await expect(combobox).toBeVisible();
    //   await combobox.click();
    // } else if (testId === 'target-project-select') {
    //   // For target project, look for the combobox in the "Source and target providers" group
    //   const providersGroup = this.page.getByRole('group', { name: 'Source and target providers' });
    //   const comboboxes = providersGroup.getByRole('combobox');
    //   const targetCombobox = comboboxes.last(); // Target project is the last combobox in this group
    //   await expect(targetCombobox).toBeVisible();
    //   await targetCombobox.click();
    // } else {
    //   throw new Error(`Unsupported testId: ${testId}`);
    // }

    // // Wait for and click the option
    // const option = this.page.getByRole('option', { name: projectName });
    // await expect(option).toBeVisible();
    // await option.click();
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
    await this.page.waitForResponse(API_ENDPOINTS.targetNamespaces('*'));
  }
}
