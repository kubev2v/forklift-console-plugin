import { expect, type Page } from '@playwright/test';

import { ProviderType } from '../../types/enums';
import type { ProviderData } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { V2_12_0 } from '../../utils/version/constants';
import { isVersionAtLeast } from '../../utils/version/version';

import { CredentialsTab } from './tabs/CredentialsTab';
import { DetailsTab } from './tabs/DetailsTab';
import { VirtualMachinesTab } from './tabs/VirtualMachinesTab';

/** URL navigation timeout after the Create Provider wizard submits — not full K8s reconciliation. */
const PROVIDER_CREATION_TIMEOUT_MS = 60_000;

export class ProviderDetailsPage {
  private readonly navigation: NavigationHelper;
  public readonly credentialsTab: CredentialsTab;
  public readonly detailsTab: DetailsTab;
  protected readonly page: Page;
  public readonly virtualMachinesTab: VirtualMachinesTab;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
    this.credentialsTab = new CredentialsTab(page);
    this.detailsTab = new DetailsTab(page);
    this.virtualMachinesTab = new VirtualMachinesTab(page);
  }

  private getProviderTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      ec2: 'Amazon EC2',
      hyperv: 'HyperV',
      openshift: 'OpenShift',
      openstack: 'OpenStack',
      ova: 'OVA',
      ovirt: 'oVirt',
      vsphere: 'VMware',
    };
    return typeMap[type] ?? type;
  }

  private isProviderDetailsUrl(url: URL, providerName: string, namespace: string): boolean {
    const urlStr = url.toString();
    const encodedName = encodeURIComponent(providerName);

    return (
      urlStr.includes(`/ns/${namespace}/`) &&
      urlStr.includes(`forklift.konveyor.io~v1beta1~Provider/${encodedName}`) &&
      !urlStr.includes('~new')
    );
  }

  async clickCreatePlanButton(): Promise<void> {
    const createPlanButton = isVersionAtLeast(V2_12_0)
      ? this.page.getByTestId('create-plan-from-provider-button')
      : this.page.getByRole('button', { name: 'Create migration plan' });
    await expect(createPlanButton).toBeVisible();
    await expect(createPlanButton).toBeEnabled();
    await createPlanButton.click();
  }

  async clickInspectVmsButton(): Promise<void> {
    await expect(this.inspectVmsButton).toBeVisible();
    await this.inspectVmsButton.click();
  }

  get inspectVmsButton() {
    return this.page.getByTestId('provider-inspect-vms-button');
  }

  get inspectVmsMenuItem() {
    return this.page.getByTestId('provider-actions-inspect-menuitem');
  }

  async isInspectVmsButtonVisible(): Promise<boolean> {
    return await this.inspectVmsButton.isVisible();
  }

  async navigate(providerName: string, namespace: string): Promise<void> {
    await this.navigation.navigateToK8sResource({
      resource: 'Provider',
      name: providerName,
      namespace,
    });
  }

  async navigateToCredentialsTab(): Promise<void> {
    await this.credentialsTab.navigateToCredentialsTab();
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    await this.virtualMachinesTab.navigateToVirtualMachinesTab();
  }

  async verifyBreadcrumbs(): Promise<void> {
    await expect(this.page.getByTestId('breadcrumb-link-0')).toContainText('Providers');
    await expect(this.page.getByTestId('breadcrumb-item-1')).toContainText('Provider details');
  }

  async verifyInspectVmsButtonVisible(): Promise<void> {
    await expect(this.inspectVmsButton).toBeVisible({ timeout: 15000 });
  }

  async verifyNavigationTabs(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await expect(detailsTab).toBeVisible();
    const virtualMachinesTab = this.page.locator(
      '[data-test-id="horizontal-link-Virtual machines"]',
    );
    await expect(virtualMachinesTab).toBeVisible();
  }

  async verifyProviderDetails(providerData: ProviderData): Promise<void> {
    await expect(this.page.getByTestId('resource-details-title')).toContainText(providerData.name);
    await expect(this.page.getByTestId('name-detail-item')).toContainText(providerData.name);

    const displayType = this.getProviderTypeDisplayName(providerData.type);

    await expect(this.page.getByTestId('type-detail-item')).toContainText(displayType);
    await expect(this.page.getByTestId('url-detail-item')).toContainText(providerData.hostname);
    await expect(this.page.getByTestId('project-detail-item')).toContainText(MTV_NAMESPACE);

    if (providerData.type === ProviderType.VSPHERE) {
      await expect(this.page.getByTestId('product-detail-item')).toContainText('');
    }

    if (providerData.type !== ProviderType.OVA && providerData.type !== ProviderType.EC2) {
      await expect(this.page.getByTestId('credentials-detail-item')).toContainText('');
    }

    // Only verify VDDK field for vSphere providers
    if (providerData.type === ProviderType.VSPHERE) {
      const vddkElement = this.page.getByTestId('vddk-detail-item');
      if (providerData.vddkInitImage) {
        await expect(vddkElement).toContainText(providerData.vddkInitImage);
      } else {
        await expect(vddkElement).toContainText('Empty');
      }
    }

    await expect(this.page.getByTestId('created-at-detail-item')).toBeVisible();
    await expect(this.page.getByTestId('owner-detail-item')).toContainText('No owner');
    const statusLocator = this.page.getByTestId('resource-status');
    // Provider status might be "Staging" or "ConnectionFailed" in test environment
    await expect(statusLocator).toContainText(/Ready|Staging|ConnectionFailed/);
  }

  async verifyProviderDetailsURL(providerName: string, namespace: string): Promise<void> {
    await expect(this.page).toHaveURL((url) =>
      this.isProviderDetailsUrl(url, providerName, namespace),
    );
  }

  // Deep inspection methods

  async verifyProviderStatus(expectedStatus: string): Promise<void> {
    await expect(this.page.getByTestId('resource-status')).toContainText(expectedStatus, {
      timeout: 30000,
    });
  }

  async verifyProviderTitle(providerName: string): Promise<void> {
    const titleLocator = this.page.getByTestId('resource-details-title');
    await expect(titleLocator).toContainText(providerName);
  }

  async waitForInventoryReady(timeoutMs = 180000): Promise<void> {
    await this.waitForReadyStatus(timeoutMs);
    await this.virtualMachinesTab.navigateToVirtualMachinesTab();

    const treegrid = this.page.getByRole('treegrid');
    await expect(treegrid).toBeVisible({ timeout: 30000 });
    const vmRow = treegrid.locator(
      'tbody tr[data-testid^="folder-"], tbody tr[data-testid^="vm-"]',
    );
    await expect(vmRow.first()).toBeVisible({ timeout: timeoutMs });

    await this.page.locator('[data-test-id="horizontal-link-Details"]').click();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForProviderCreation(
    providerName: string,
    namespace: string,
    timeoutMs = PROVIDER_CREATION_TIMEOUT_MS,
  ): Promise<void> {
    try {
      await this.page.waitForURL((url) => this.isProviderDetailsUrl(url, providerName, namespace), {
        timeout: timeoutMs,
        waitUntil: 'commit',
      });
    } catch (error) {
      const creationError = this.page.getByRole('heading', { name: /Error creating provider/i });
      if (await creationError.isVisible()) {
        const alert = this.page.getByRole('alert').filter({ hasText: 'Error creating provider' });
        await expect(alert.first()).toBeVisible({ timeout: 5_000 });
        const rawMessage = ((await alert.first().textContent()) ?? '').trim();
        const message = rawMessage.length > 0 ? rawMessage : 'unknown error';
        throw new Error(`Provider creation failed: ${message}`, { cause: error });
      }
      throw error;
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForReadyStatus(timeoutMs = 180000): Promise<void> {
    const statusLocator = this.page.getByTestId('resource-status');
    await expect(statusLocator).toContainText('Ready', { timeout: timeoutMs });
  }
}
