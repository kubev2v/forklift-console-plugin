import { expect, type Page } from '@playwright/test';

import type { ProviderData } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

import { VirtualMachinesTab } from './tabs/VirtualMachinesTab';

export class ProviderDetailsPage {
  private readonly navigation: NavigationHelper;
  protected readonly page: Page;
  public readonly virtualMachinesTab: VirtualMachinesTab;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationHelper(page);
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
    await expect(this.page.getByTestId('type-detail-item')).toContainText(
      providerData.type === 'vsphere' ? 'VMware' : providerData.type,
    );
    await expect(this.page.getByTestId('url-detail-item')).toContainText(providerData.hostname);
    await expect(this.page.getByTestId('project-detail-item')).toContainText(MTV_NAMESPACE);
    await expect(this.page.getByTestId('product-detail-item')).toContainText('');
    await expect(this.page.getByTestId('credentials-detail-item')).toContainText('');
    await expect(this.page.getByTestId('vddk-detail-item')).toContainText(
      providerData.vddkInitImage ?? '',
    );
    await expect(this.page.getByTestId('created-at-detail-item')).toBeVisible();
    await expect(this.page.getByTestId('owner-detail-item')).toContainText('No owner');
    const statusLocator = this.page.getByTestId('resource-status');
    // Provider status might be "Staging" in test environment
    await expect(statusLocator).toContainText(/Ready|Staging/);
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
    await expect(titleLocator).toContainText(providerName, { timeout: 15000 });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  }

  async waitForReadyStatus(timeoutMs = 120000): Promise<void> {
    const statusLocator = this.page.getByTestId('resource-status');
    await expect(statusLocator).toContainText('Ready', { timeout: timeoutMs });
  }
}
