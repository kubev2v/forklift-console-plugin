import { expect, type Page } from '@playwright/test';

import { EndpointType, ProviderType } from '../types/enums';
import type { ProviderData } from '../types/test-data';
import { NavigationHelper } from '../utils/NavigationHelper';
import type { ResourceManager } from '../utils/resource-manager/ResourceManager';
import { isVersionAtLeast, V2_11_0 } from '../utils/version';

import { ProviderDetailsPage } from './ProviderDetailsPage/ProviderDetailsPage';

export class CreateProviderPage {
  private readonly resourceManager?: ResourceManager;
  // Certificate validation locators
  readonly certificateConfigureRadio;
  readonly certificateSkipRadio;

  readonly certificateUploadInput;
  public readonly navigationHelper: NavigationHelper;
  protected readonly page: Page;
  // VDDK Setup locators
  readonly vddkAioCheckbox;
  readonly vddkImageInput;
  readonly vddkManualRadio;

  readonly vddkSkipRadio;
  readonly vddkSkipWarning;
  readonly vddkUploadRadio;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
    this.navigationHelper = new NavigationHelper(page);

    // Certificate validation locators
    this.certificateConfigureRadio = page.getByTestId('certificate-validation-configure');
    this.certificateSkipRadio = page.getByTestId('certificate-validation-skip');
    this.certificateUploadInput = page.locator('#caCertificate');

    // VDDK Setup locators
    this.vddkAioCheckbox = page.getByTestId('vddk-aio-optimization-checkbox');
    this.vddkImageInput = page.getByTestId('vsphere-vddk-image-input');
    this.vddkManualRadio = page.getByTestId('vddk-setup-manual-radio');
    this.vddkSkipRadio = page.getByTestId('vddk-setup-skip-radio');
    this.vddkSkipWarning = page.getByRole('heading', {
      name: /It is highly recommended to use a VDDK image/,
    });
    this.vddkUploadRadio = page.getByTestId('vddk-setup-upload-radio');
  }

  private async configureVddkSetup(testData: ProviderData) {
    if (!isVersionAtLeast(V2_11_0)) {
      if (testData.skipVddk) {
        await this.page
          .getByRole('checkbox', { name: /Skip VMware Virtual Disk Development Kit/ })
          .check();
        return;
      }
      if (testData.vddkInitImage) {
        await this.page
          .getByRole('textbox', { name: /VDDK init image/i })
          .fill(testData.vddkInitImage);
      }
      return;
    }

    if (testData.skipVddk) {
      await this.page.getByTestId('vddk-setup-skip-radio').click();
      return;
    }
    if (testData.vddkInitImage) {
      await this.page.getByTestId('vddk-setup-manual-radio').click();
      await this.page.getByTestId('vsphere-vddk-image-input').fill(testData.vddkInitImage);
    } else {
      await this.page.getByTestId('vddk-setup-skip-radio').click();
      return;
    }
    if (testData.useVddkAioOptimization !== undefined) {
      const aioCheckbox = this.page.getByTestId('vddk-aio-optimization-checkbox');
      if ((await aioCheckbox.isChecked()) !== testData.useVddkAioOptimization) {
        await aioCheckbox.click();
      }
    }
  }

  private async fillOVAFields(testData: ProviderData) {
    await this.page.getByTestId('nfs-directory-input').fill(testData.hostname ?? '');

    if (testData.applianceManagement !== undefined) {
      const applianceCheckbox = this.page.getByTestId('ova-appliance-management-checkbox');
      const isChecked = await applianceCheckbox.isChecked();

      if (isChecked !== testData.applianceManagement) {
        await applianceCheckbox.click();
      }
    }
  }

  private async fillOVirtFields(testData: ProviderData) {
    await this.page.getByTestId('ovirt-url-input').fill(testData.hostname ?? '');
    await this.page.getByTestId('ovirt-username-input').fill(testData.username ?? '');
    await this.page.getByTestId('ovirt-password-input').fill(testData.password ?? '');
  }

  private async fillVSphereFields(testData: ProviderData) {
    if (!isVersionAtLeast(V2_11_0)) {
      const vcenterRadio = this.page.getByRole('radio', { name: 'vCenter' });
      const esxiRadio = this.page.getByRole('radio', { name: 'ESXi' });
      if (testData.endpointType === EndpointType.ESXI) {
        await esxiRadio.click();
      } else {
        await vcenterRadio.click();
      }
      await this.page.getByRole('textbox', { name: 'URL' }).fill(testData.hostname ?? '');
      await this.configureVddkSetup(testData);
      await this.page.getByRole('textbox', { name: 'Username' }).fill(testData.username ?? '');
      await this.page
        .getByRole('textbox', { name: 'Password input' })
        .fill(testData.password ?? '');
      return;
    }

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
    if (!isVersionAtLeast(V2_11_0)) {
      await this.page
        .getByRole('checkbox', { name: /Skip certificate validation/i })
        .check({ force: true });
      return;
    }
    await this.page.getByTestId('certificate-validation-skip').click();
  }

  private async submitForm(testData: ProviderData) {
    const createButtonTestId = isVersionAtLeast(V2_11_0)
      ? 'provider-create-button'
      : 'create-provider-button';
    await this.page.getByTestId(createButtonTestId).click();

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
    if (!isVersionAtLeast(V2_11_0)) {
      const projectSelect = this.page.getByTestId('target-project-select');
      await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
      await projectSelect.getByRole('button').click();
      await projectSelect.getByRole('combobox').fill(projectName);
      const option = this.page.getByRole('option', { name: projectName });
      await option.waitFor({ state: 'visible', timeout: 10000 });
      await option.click();
      return;
    }

    const projectSelect = this.page.getByTestId('provider-project-select');
    await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
    const textInput = projectSelect.locator('input');
    const currentValue = await textInput.inputValue();
    if (currentValue === projectName) return;
    await textInput.click();
    await textInput.clear();
    await textInput.fill(projectName);
    const option = this.page.getByRole('option', { name: projectName, exact: true });
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  async selectProviderType(providerType: ProviderType) {
    if (!isVersionAtLeast(V2_11_0)) {
      await this.page.getByTestId(`${providerType}-provider-card`).locator('label').click();
      return;
    }
    const typeToggle = this.page.getByTestId('provider-type-toggle');
    await typeToggle.click();
    await this.page.getByTestId(`provider-type-option-${providerType}`).click();
  }

  async waitForWizardLoad() {
    await expect(this.page.getByRole('heading', { name: 'Create provider' })).toBeVisible();
  }
}
