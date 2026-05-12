import { expect, type Page } from '@playwright/test';

import { EndpointType, ProviderType } from '../types/enums';
import type { ProviderData } from '../types/test-data';
import { NavigationHelper } from '../utils/NavigationHelper';
import type { ResourceManager } from '../utils/resource-manager/ResourceManager';
import { V2_11_0 } from '../utils/version/constants';
import { isVersionAtLeast } from '../utils/version/version';

import { fillEC2ProviderFields } from './CreateProviderPage/fillEC2ProviderFields';
import { selectProviderProject } from './CreateProviderPage/selectProviderProject';
import { skipProviderCertificateValidation } from './CreateProviderPage/skipProviderCertificateValidation';
import { VerifyCertificateModal } from './CreateProviderPage/VerifyCertificateModal';
import { ProviderDetailsPage } from './ProviderDetailsPage/ProviderDetailsPage';

export class CreateProviderPage {
  private readonly resourceManager?: ResourceManager;
  // Certificate validation locators
  readonly caCertificateErrorText;
  readonly certificateConfigureRadio;
  readonly certificateSkipRadio;
  readonly certificateUploadInput;
  readonly createButton;
  readonly ec2AccessKeyIdInput;
  readonly ec2AutoTargetCheckbox;
  readonly ec2CrossAccountCheckbox;
  readonly ec2RegionInput;
  readonly ec2SecretAccessKeyInput;
  readonly ec2TargetAccessKeyIdInput;
  readonly ec2TargetAzInput;
  readonly ec2TargetRegionInput;
  readonly ec2TargetSecretAccessKeyInput;
  readonly fetchCertificateButton;
  public readonly navigationHelper: NavigationHelper;
  protected readonly page: Page;
  // VDDK Setup locators
  readonly vddkAioCheckbox;
  readonly vddkImageInput;
  readonly vddkManualRadio;

  readonly vddkSkipRadio;
  readonly vddkSkipWarning;
  readonly vddkUploadRadio;
  readonly verifyCertificateModal: VerifyCertificateModal;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
    this.navigationHelper = new NavigationHelper(page);

    // Certificate validation locators
    this.certificateConfigureRadio = page.getByTestId('certificate-validation-configure');
    this.certificateSkipRadio = page.getByTestId('certificate-validation-skip');
    this.certificateUploadInput = page.locator('#caCertificate');
    this.fetchCertificateButton = page.getByRole('button', {
      name: 'Fetch certificate from URL',
    });
    this.caCertificateErrorText = page.getByTestId('ca-certificate-helper-error');
    this.verifyCertificateModal = new VerifyCertificateModal(page);

    this.ec2AccessKeyIdInput = page.getByTestId('ec2-access-key-id-input');
    this.ec2AutoTargetCheckbox = page.getByTestId('ec2-auto-target-credentials-checkbox');
    this.ec2CrossAccountCheckbox = page.getByTestId('ec2-cross-account-credentials-checkbox');
    this.ec2RegionInput = page.getByTestId('ec2-region-input');
    this.ec2SecretAccessKeyInput = page.getByTestId('ec2-secret-access-key-input');
    this.ec2TargetAccessKeyIdInput = page.getByTestId('ec2-target-access-key-id-input');
    this.ec2TargetAzInput = page.getByTestId('ec2-target-az-input');
    this.ec2TargetRegionInput = page.getByTestId('ec2-target-region-input');
    this.ec2TargetSecretAccessKeyInput = page.getByTestId('ec2-target-secret-access-key-input');

    const createButtonTestId = isVersionAtLeast(V2_11_0)
      ? 'provider-create-button'
      : 'create-provider-button';
    this.createButton = page.getByTestId(createButtonTestId);

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

  private async fillHypervFields(testData: ProviderData) {
    // SMB URL must be filled first — credential fields render only after it has a value
    await this.page.locator('#smbUrl').fill(testData.smbUrl ?? '');
    await this.page.getByTestId('hyperv-host-input').waitFor({ state: 'visible', timeout: 10000 });

    await this.page.getByTestId('hyperv-host-input').fill(testData.hostname ?? '');
    await this.page.getByTestId('hyperv-username-input').fill(testData.username ?? '');
    await this.page.getByTestId('hyperv-password-input').fill(testData.password ?? '');

    if (testData.useDifferentSmbCredentials) {
      const checkbox = this.page.locator('#useDifferentSmbCredentials');
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
      }
      await this.page.getByTestId('smb-user-input').fill(testData.smbUsername ?? '');
      await this.page.getByTestId('smb-password-input').fill(testData.smbPassword ?? '');
    }
  }

  private async fillOpenStackFields(testData: ProviderData) {
    await this.page.getByTestId('openstack-url-input').fill(testData.hostname ?? '');
    await this.page.getByTestId('openstack-username-input').fill(testData.username ?? '');
    await this.page.getByTestId('openstack-password-input').fill(testData.password ?? '');
    await this.page.getByTestId('openstack-region-input').fill(testData.regionName ?? '');
    await this.page
      .getByTestId('openstack-project-input')
      .fill(testData.openstackProjectName ?? '');
    await this.page.getByTestId('openstack-domain-input').fill(testData.domainName ?? '');
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

  private async submitForm(testData: ProviderData) {
    await this.createButton.click();

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

  async enterCaCertificate(certificate: string): Promise<void> {
    await this.certificateUploadInput.fill(certificate);
  }

  async fetchAndAcceptCertificate(): Promise<void> {
    await this.fetchCertificateButton.click();
    await this.verifyCertificateModal.waitForModalToOpen();
    await this.verifyCertificateModal.trustAndSave();
  }

  async fillAndSubmit(testData: ProviderData): Promise<void> {
    await this.fillProviderFields(testData);

    if (testData.type !== ProviderType.OVA && testData.type !== ProviderType.EC2) {
      await skipProviderCertificateValidation(this.page);
    }

    await this.submitForm(testData);
  }

  async fillProviderFields(testData: ProviderData): Promise<void> {
    await this.selectProject(testData.projectName);
    await this.selectProviderType(testData.type);
    await this.fillProviderName(testData.name);

    switch (testData.type) {
      case ProviderType.EC2:
        await fillEC2ProviderFields(this.page, testData);
        break;
      case ProviderType.HYPERV:
        await this.fillHypervFields(testData);
        break;
      case ProviderType.OPENSTACK:
        await this.fillOpenStackFields(testData);
        break;
      case ProviderType.OVA:
        await this.fillOVAFields(testData);
        break;
      case ProviderType.OVIRT:
        await this.fillOVirtFields(testData);
        break;
      case ProviderType.VSPHERE:
        await this.fillVSphereFields(testData);
        break;
      default:
        break;
    }
  }

  async fillProviderName(name: string): Promise<void> {
    await this.page.getByTestId('provider-name-input').fill(name);
  }

  async getCaCertificateValue(): Promise<string> {
    return (await this.certificateUploadInput.inputValue()) ?? '';
  }

  getProviderTypeToggle() {
    return this.page.getByTestId('provider-type-toggle');
  }

  async navigate(namespace?: string): Promise<void> {
    await this.navigationHelper.navigateToConsole();
    await this.navigationHelper.navigateToK8sResource({
      resource: 'Provider',
      namespace,
      allNamespaces: true,
    });
    await this.page.waitForLoadState('domcontentloaded');

    const createButton = this.page.getByTestId('add-provider-button');
    await createButton.waitFor({ state: 'visible', timeout: 20000 });
    await createButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateWithProviderType(providerType: string): Promise<void> {
    await this.page.goto(
      `/k8s/cluster/forklift.konveyor.io~v1beta1~Provider/~new?providerType=${providerType}`,
    );
    await this.page.waitForLoadState('networkidle');
  }

  async selectProject(projectName: string): Promise<void> {
    await selectProviderProject(this.page, projectName);
  }

  async selectProviderType(providerType: ProviderType): Promise<void> {
    if (!isVersionAtLeast(V2_11_0)) {
      await this.page.getByTestId(`${providerType}-provider-card`).locator('label').click();
      return;
    }
    const typeToggle = this.page.getByTestId('provider-type-toggle');
    await typeToggle.click();
    await this.page.getByTestId(`provider-type-option-${providerType}`).click();
  }

  async submitCreateForm(providerName?: string, projectName?: string): Promise<void> {
    await this.createButton.click();
    if (this.resourceManager && providerName) {
      this.resourceManager.addProvider(providerName, projectName ?? '');
    }
  }

  async waitForWizardLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Create provider' })).toBeVisible();
  }
}
