import type { V1beta1Provider } from '@kubev2v/types';
import { expect, type Page } from '@playwright/test';

import type { ProviderData } from '../types/test-data';
import type { ResourceManager } from '../utils/resource-manager/ResourceManager';

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
      const provider: V1beta1Provider = {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Provider',
        metadata: {
          name: testData.name,
          namespace: 'openshift-mtv',
        },
      };

      this.resourceManager.addResource(provider);
    }
  }

  async waitForWizardLoad() {
    await expect(this.page.getByText('Create new provider')).toBeVisible();
  }
}
