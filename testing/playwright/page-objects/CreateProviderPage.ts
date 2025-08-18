import { expect, type Page } from '@playwright/test';

import type { ProviderData } from '../types/test-data';
import type { ResourceManager } from '../utils/ResourceManager';

export class CreateProviderPage {
  private readonly resourceManager?: ResourceManager;
  protected readonly page: Page;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
  }

  async fillAndSubmit(testData: ProviderData) {
    await this.page.getByTestId(`${testData.type}-provider-card`).locator('label').click();
    await this.page.getByTestId('provider-name-input').fill(testData.name);

    // Select SDK endpoint based on endpointType
    if (testData.endpointType) {
      await this.page
        .locator(`input[name="sdkEndpoint"][id="sdkEndpoint-${testData.endpointType}"]`)
        .click();
    }

    await this.page.getByTestId('provider-url-input').fill(testData.hostname ?? '');

    if (testData.vddkInitImage) {
      await this.page.getByTestId('provider-vddk-input').fill(testData.vddkInitImage);
    }

    await this.page.getByTestId('provider-username-input').fill(testData.username ?? '');

    if (testData.password) {
      await this.page.getByTestId('provider-password-input').fill(testData.password);
    }
    await this.page.locator('#insecureSkipVerify-off').click();

    // Track the provider for cleanup before creation
    if (this.resourceManager && testData.name) {
      this.resourceManager.addResource({
        namespace: 'openshift-mtv',
        resourceType: 'providers',
        resourceName: testData.name,
      });
    }

    await this.page.getByTestId('create-provider-button').click();
  }

  async waitForWizardLoad() {
    await expect(this.page.getByText('Create new provider')).toBeVisible();
  }
}
