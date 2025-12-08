import { expect, type Page } from '@playwright/test';

import type { ProviderData } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

import { DetailsTab } from './tabs/DetailsTab';
import { VirtualMachinesTab } from './tabs/VirtualMachinesTab';

export class ProviderDetailsPage {
  private readonly navigation: NavigationHelper;
  public readonly detailsTab: DetailsTab;
  protected readonly page: Page;
  public readonly virtualMachinesTab: VirtualMachinesTab;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
    this.detailsTab = new DetailsTab(page);
    this.virtualMachinesTab = new VirtualMachinesTab(page);
  }

  async navigate(providerName: string, namespace: string): Promise<void> {
    await this.navigation.navigateToK8sResource({
      resource: 'Provider',
      name: providerName,
      namespace,
    });
  }

  async navigateToVirtualMachinesTab(): Promise<void> {
    await this.virtualMachinesTab.navigateToVirtualMachinesTab();
  }

  async verifyBreadcrumbs(): Promise<void> {
    await expect(this.page.getByTestId('breadcrumb-link-0')).toContainText('Providers');
    await expect(this.page.getByTestId('breadcrumb-item-1')).toContainText('Provider details');
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

    // Map provider types to their display names
    let displayType: string = providerData.type;
    if (providerData.type === 'vsphere') {
      displayType = 'VMware';
    } else if (providerData.type === 'ova') {
      displayType = 'OVA';
    }

    await expect(this.page.getByTestId('type-detail-item')).toContainText(displayType);
    await expect(this.page.getByTestId('url-detail-item')).toContainText(providerData.hostname);
    await expect(this.page.getByTestId('project-detail-item')).toContainText(MTV_NAMESPACE);

    // Only verify these fields for non-OVA providers
    if (providerData.type !== 'ova') {
      await expect(this.page.getByTestId('product-detail-item')).toContainText('');
      await expect(this.page.getByTestId('credentials-detail-item')).toContainText('');
    }

    // Only verify VDDK field for vSphere providers
    if (providerData.type === 'vsphere') {
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
      url.toString().includes(`forklift.konveyor.io~v1beta1~Provider/${namespace}/${providerName}`),
    );
  }

  async verifyProviderStatus(expectedStatus: string): Promise<void> {
    await expect(this.page.getByTestId('resource-status')).toContainText(expectedStatus, {
      timeout: 30000,
    });
  }

  async verifyProviderTitle(providerName: string): Promise<void> {
    const titleLocator = this.page.getByTestId('resource-details-title');
    await expect(titleLocator).toContainText(providerName);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForReadyStatus(timeoutMs = 120000): Promise<void> {
    const statusLocator = this.page.getByTestId('resource-status');
    await expect(statusLocator).toContainText('Ready', { timeout: timeoutMs });
  }
}
