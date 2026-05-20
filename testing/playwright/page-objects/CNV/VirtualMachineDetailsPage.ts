import { expect, type Locator, type Page } from '@playwright/test';

import { PAGE_LOAD_TIMEOUT } from '../../utils/resource-manager/constants';
import { disableGuidedTour } from '../../utils/utils';

const CNV_VM_URL_PATTERN = /kubevirt\.io~v1~VirtualMachine/;

/**
 * Page object for the kubevirt-enhanced VirtualMachine details page.
 * Tabs: Overview, Metrics, YAML, Configuration, Events, Console, Snapshots, Diagnostics
 */
export class VirtualMachineDetailsPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get main(): Locator {
    return this.page.locator('main');
  }

  get overviewTab(): Locator {
    return this.main.getByRole('link', { name: 'Overview', exact: true });
  }

  async verifySmokeOverview(expectedName: string): Promise<void> {
    await expect(this.main.getByText(expectedName, { exact: true }).first()).toBeVisible();

    await expect(
      this.main
        .locator('dt')
        .filter({ hasText: /^Name$/ })
        .first(),
    ).toBeVisible();
    await expect(
      this.main
        .locator('dt')
        .filter({ hasText: /^Status$/ })
        .first(),
    ).toBeVisible();
    await expect(
      this.main
        .locator('dt')
        .filter({ hasText: /^CPU \| Memory$/ })
        .first(),
    ).toBeVisible();

    await expect(this.main.getByRole('link', { name: /Network \(\d+\)/ })).toBeVisible();
    await expect(this.main.getByRole('link', { name: /Storage \([1-9]\d*\)/ })).toBeVisible();
  }

  async waitForPageLoad(vmName?: string): Promise<void> {
    await expect(this.page).toHaveURL(CNV_VM_URL_PATTERN, { timeout: PAGE_LOAD_TIMEOUT });
    await disableGuidedTour(this.page);
    // The CNV "Welcome to OpenShift Virtualization" modal blocks the page on first visit.
    const welcomeDialog = this.page.getByRole('dialog', { name: 'Welcome modal' });
    try {
      await welcomeDialog.waitFor({ state: 'visible', timeout: 3000 });
      await welcomeDialog.getByRole('button', { name: 'Close' }).click();
      await welcomeDialog.waitFor({ state: 'hidden' });
    } catch {
      // Dialog not present — safe to ignore
    }
    await expect(this.overviewTab).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
    if (vmName) {
      await expect(this.main.getByText(vmName, { exact: true }).first()).toBeVisible({
        timeout: PAGE_LOAD_TIMEOUT,
      });
    }
  }
}

export default VirtualMachineDetailsPage;
