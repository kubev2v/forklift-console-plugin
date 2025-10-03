import { expect, type Page } from '@playwright/test';

import type { ProviderData } from '../types/test-data';
import { NavigationHelper } from '../utils/NavigationHelper';
import type { ResourceManager } from '../utils/resource-manager/ResourceManager';

export class CreateProviderPage {
  private readonly resourceManager?: ResourceManager;
  public readonly navigationHelper: NavigationHelper;
  protected readonly page: Page;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
    this.navigationHelper = new NavigationHelper(page);
  }

  async fillAndSubmit(testData: ProviderData) {
    await this.selectProject(testData.projectName);
    await this.page.getByTestId(`${testData.type}-provider-card`).locator('label').click();
    await this.page.getByTestId('provider-name-input').fill(testData.name);

    if (testData.endpointType) {
      await this.page
        .locator(`input[name="sdkEndpoint"][id="sdkEndpoint-${testData.endpointType}"]`)
        .click();
    }

    await this.page.getByTestId('provider-url-input').fill(testData.hostname ?? '');

    if (testData.vddkInitImage) {
      await this.page.getByTestId('provider-vddk-input').fill(testData.vddkInitImage);
    }

    if (testData.useVddkAioOptimization !== undefined) {
      const checkbox = this.page.locator('#useVddkAioOptimization');
      const isChecked = await checkbox.isChecked();

      if (isChecked !== testData.useVddkAioOptimization) {
        await checkbox.click();
      }
    }

    await this.page.getByTestId('provider-username-input').fill(testData.username ?? '');

    if (testData.password) {
      await this.page.getByTestId('provider-password-input').fill(testData.password);
    }
    await this.page.locator('#insecureSkipVerify-off').click();

    await this.page.getByTestId('create-provider-button').click();

    if (this.resourceManager && testData.name) {
      this.resourceManager.addProvider(testData.name, testData.projectName);
    }
  }

  async navigate(namespace?: string): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: 'Provider',
      namespace: namespace ?? 'openshift-mtv',
      action: 'new',
    });
  }

  async selectProject(projectName: string, showDefaultProjects = false) {
    const projectSelect = this.page.getByTestId('target-project-select');
    await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
    await projectSelect.getByRole('button').click();

    if (showDefaultProjects) {
      await this.page.locator('label[for="show-default-projects-switch"]').click();
    }

    const searchBox = projectSelect.getByRole('combobox');
    await searchBox.fill(projectName);

    const option = this.page.getByRole('option', { name: projectName });
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
  }

  async waitForWizardLoad() {
    await expect(this.page.getByText('Create new provider')).toBeVisible();
  }
}
