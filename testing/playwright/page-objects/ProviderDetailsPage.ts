import { expect, type Page } from '@playwright/test';

import type { ProviderData } from '../types/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export class ProviderDetailsPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  }
}
