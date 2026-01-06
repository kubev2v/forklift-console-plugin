import { expect, type Page } from '@playwright/test';

import { EndpointType, ProviderType } from '../types/enums';
import type { ProviderData } from '../types/test-data';
import { NavigationHelper } from '../utils/NavigationHelper';
import type { ResourceManager } from '../utils/resource-manager/ResourceManager';

import { ProviderDetailsPage } from './ProviderDetailsPage/ProviderDetailsPage';

export class CreateProviderPage {
  private readonly resourceManager?: ResourceManager;
  public readonly navigationHelper: NavigationHelper;
  protected readonly page: Page;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
    this.navigationHelper = new NavigationHelper(page);
  }

  private async configureVddkSetup(testData: ProviderData) {
    if (testData.skipVddk) {
      await this.page.getByTestId('vddk-setup-skip-radio').click();
      // AIO checkbox is not available when skipping VDDK
      return;
    }

    if (testData.vddkInitImage) {
      await this.page.getByTestId('vddk-setup-manual-radio').click();
      await this.page.getByTestId('vsphere-vddk-image-input').fill(testData.vddkInitImage);
    } else {
      await this.page.getByTestId('vddk-setup-skip-radio').click();
      return;
    }

    // AIO checkbox is only visible when VDDK is configured (not skipped)
    if (testData.useVddkAioOptimization !== undefined) {
      const aioCheckbox = this.page.getByTestId('vddk-aio-optimization-checkbox');
      const isChecked = await aioCheckbox.isChecked();

      if (isChecked !== testData.useVddkAioOptimization) {
        await aioCheckbox.click();
      }
    }
  }

  private async fillOVAFields(testData: ProviderData) {
    await this.page.getByTestId('nfs-directory-input').fill(testData.hostname ?? '');
  }

  private async fillOVirtFields(testData: ProviderData) {
    await this.page.getByTestId('ovirt-url-input').fill(testData.hostname ?? '');
    await this.page.getByTestId('ovirt-username-input').fill(testData.username ?? '');
    await this.page.getByTestId('ovirt-password-input').fill(testData.password ?? '');
  }

  private async fillVSphereFields(testData: ProviderData) {
    const esxiRadio = this.page.getByTestId('vsphere-endpoint-esxi-radio');
    const vcenterRadio = this.page.getByTestId('vsphere-endpoint-vcenter-radio');
    await vcenterRadio.waitFor({ state: 'visible', timeout: 10000 });

    if (testData.endpointType === EndpointType.ESXI) {
      await esxiRadio.click();
      await expect(esxiRadio).toBeChecked({ timeout: 5000 });
    } else {
      await vcenterRadio.click();
      await expect(vcenterRadio).toBeChecked({ timeout: 5000 });
    }

    await this.page.getByTestId('vsphere-url-input').fill(testData.hostname ?? '');
    await this.configureVddkSetup(testData);
    await this.page.getByTestId('vsphere-username-input').fill(testData.username ?? '');
    await this.page.getByTestId('vsphere-password-input').fill(testData.password ?? '');
  }

  private async skipCertificateValidation() {
    await this.page.getByTestId('certificate-validation-skip').click();
  }

  private async submitForm(testData: ProviderData) {
    await this.page.getByTestId('provider-create-button').click();

    if (this.resourceManager && testData.name) {
      this.resourceManager.addProvider(testData.name, testData.projectName);
    }
  }

  async create(testData: ProviderData, waitForReady = true): Promise<ProviderDetailsPage> {
    const providerDetailsPage = new ProviderDetailsPage(this.page);

    await this.waitForWizardLoad();
    await this.fillAndSubmit(testData);
    await providerDetailsPage.waitForPageLoad();

    if (waitForReady) {
      await providerDetailsPage.waitForReadyStatus();
    }

    await providerDetailsPage.verifyProviderDetails(testData);
    return providerDetailsPage;
  }

  async fillAndSubmit(testData: ProviderData) {
    await this.selectProject(testData.projectName);
    await this.selectProviderType(testData.type);
    await this.fillProviderName(testData.name);

    switch (testData.type) {
      case ProviderType.VSPHERE:
        await this.fillVSphereFields(testData);
        break;
      case ProviderType.OVIRT:
        await this.fillOVirtFields(testData);
        break;
      case ProviderType.OVA:
        await this.fillOVAFields(testData);
        break;
      case ProviderType.OPENSTACK:
      default:
        break;
    }

    if (testData.type !== ProviderType.OVA) {
      await this.skipCertificateValidation();
    }

    await this.submitForm(testData);
  }

  async fillProviderName(name: string) {
    await this.page.getByTestId('provider-name-input').fill(name);
  }

  async navigate(namespace?: string): Promise<void> {
    await this.navigationHelper.navigateToConsole();
    await this.navigationHelper.navigateToK8sResource({
      resource: 'Provider',
      namespace,
      allNamespaces: true,
    });
    await this.page.waitForLoadState('networkidle');

    const createButton = this.page.getByTestId('add-provider-button');
    await createButton.waitFor({ state: 'visible', timeout: 20000 });
    await createButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectProject(projectName: string) {
    const projectSelect = this.page.getByTestId('provider-project-select');
    await projectSelect.waitFor({ state: 'visible', timeout: 10000 });

    const textInput = projectSelect.locator('input');
    const currentValue = await textInput.inputValue();

    if (currentValue === projectName) {
      return;
    }

    await textInput.click();
    await textInput.clear();
    await textInput.fill(projectName);

    const option = this.page.getByRole('option', { name: projectName, exact: true });
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  async selectProviderType(providerType: ProviderType) {
    const typeToggle = this.page.getByTestId('provider-type-toggle');
    await typeToggle.click();
    await this.page.getByTestId(`provider-type-option-${providerType}`).click();
  }

  async waitForWizardLoad() {
    await expect(this.page.getByRole('heading', { name: 'Create provider' })).toBeVisible();
  }
}
