import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../types/test-data';

import { DetailsTab } from './tabs/DetailsTab';
import { MappingsTab } from './tabs/MappingsTab';
import { VirtualMachinesTab } from './tabs/VirtualMachinesTab';

export class PlanDetailsPage {
  public readonly detailsTab: DetailsTab;
  public readonly mappingsTab: MappingsTab;
  protected readonly page: Page;
  public readonly virtualMachinesTab: VirtualMachinesTab;

  constructor(page: Page) {
    this.page = page;
    this.detailsTab = new DetailsTab(page);
    this.mappingsTab = new MappingsTab(page);
    this.virtualMachinesTab = new VirtualMachinesTab(page);
  }

  async clickActionsMenuAndStart(): Promise<void> {
    const actionsButton = this.page
      .getByTestId('actions-dropdown-button')
      .or(this.page.getByRole('button', { name: /actions/i }));
    await actionsButton.click();

    const startItem = this.page.getByRole('menuitem', { name: /start|restart/i });
    await startItem.click();

    const confirmButton = this.page.getByRole('button', { name: /start|restart/i });
    await confirmButton.click();
  }

  async clickStartButtonInStatus(): Promise<void> {
    const startButton = this.page.getByRole('button', { name: 'Start' });
    await startButton.click();

    const confirmButton = this.page.getByRole('button', { name: 'Start' });
    await confirmButton.click();
  }

  async getMigrationProgress(): Promise<string> {
    let statusText = '';

    try {
      const statusLabelElement = this.page.locator('.pf-v5-c-label__text').first();
      const labelText = await statusLabelElement.textContent();
      if (labelText?.trim()) {
        statusText = labelText.trim();
      }
    } catch (error) {
      if (process.env.DEBUG_MIGRATION === 'true') {
        console.log('[DEBUG] Error getting migration progress from label:', error);
      }
    }

    if (!statusText) {
      try {
        const headingElement = this.page.locator('h1').first();
        const headingText = await headingElement.textContent();
        if (headingText) {
          const statusRegex =
            /(?:Complete|Completed|Succeeded|Incomplete|Migration running|Ready for migration|Cannot start|Paused|Canceled|Cancelled|Archived)/i;
          const statusMatch = statusRegex.exec(headingText);
          if (statusMatch) {
            const [matchedStatus] = statusMatch;
            statusText = matchedStatus;
          }
        }
      } catch (error) {
        if (process.env.DEBUG_MIGRATION === 'true') {
          console.log('[DEBUG] Error getting migration progress from heading:', error);
        }
      }
    }

    if (!statusText) {
      try {
        const statusElement = this.page.locator('.forklift-page-headings__status');
        statusText = (await statusElement.textContent()) ?? '';
      } catch (error) {
        if (process.env.DEBUG_MIGRATION === 'true') {
          console.log('[DEBUG] Error getting migration progress from forklift status:', error);
        }
      }
    }

    if (!statusText) {
      try {
        const statusDetailElement = this.page.getByTestId('status-detail-item');
        statusText = (await statusDetailElement.textContent()) ?? '';
      } catch (error) {
        if (process.env.DEBUG_MIGRATION === 'true') {
          console.log('[DEBUG] Error getting migration progress from status detail item:', error);
        }
      }
    }

    let percentage = '';
    try {
      const percentageElement = this.page.locator('.pf-v5-u-font-size-sm').filter({ hasText: '%' });

      const isPercentageVisible = await percentageElement.isVisible({ timeout: 1000 });
      if (isPercentageVisible) {
        const percentageText = await percentageElement.textContent({ timeout: 2000 });
        if (percentageText) {
          percentage = ` (${percentageText.trim()})`;
        }
      }
    } catch (error) {
      if (process.env.DEBUG_MIGRATION === 'true') {
        console.log('[DEBUG] Error getting percentage text (likely migration completed):', error);
      }
    }

    return `${statusText.trim()}${percentage}`;
  }

  async getMigrationStatus(): Promise<{ status: string; isTerminal: boolean; isSuccess: boolean }> {
    const progress = await this.getMigrationProgress();
    const percentageIndex = progress.lastIndexOf('(');
    const statusText =
      percentageIndex !== -1 && progress.includes('%)', percentageIndex)
        ? progress.substring(0, percentageIndex).trim()
        : progress.trim();

    const percentageRegex = /\((?<percentage>\d+)%\)/;
    const percentageMatch = percentageRegex.exec(progress);
    const percentage = percentageMatch?.groups?.percentage ?? 'N/A';

    if (process.env.DEBUG_MIGRATION === 'true') {
      console.log(`[DEBUG] Raw progress text: "${progress}"`);
      console.log(`[DEBUG] Cleaned status text: "${statusText}"`);
      console.log(`[DEBUG] Percentage: ${percentage}%`);
      console.log(`[DEBUG] Lowercase status: "${statusText.toLowerCase()}"`);
    }

    const terminalStates: Record<string, { isTerminal: boolean; isSuccess: boolean }> = {
      complete: { isTerminal: true, isSuccess: true },
      completed: { isTerminal: true, isSuccess: true },
      succeeded: { isTerminal: true, isSuccess: true },

      incomplete: { isTerminal: true, isSuccess: false },
      failed: { isTerminal: true, isSuccess: false },
      canceled: { isTerminal: true, isSuccess: false },
      cancelled: { isTerminal: true, isSuccess: false },
      'cannot start': { isTerminal: true, isSuccess: false },

      archived: { isTerminal: true, isSuccess: false },
      paused: { isTerminal: true, isSuccess: false },

      'migration running': { isTerminal: false, isSuccess: false },
      'ready for migration': { isTerminal: false, isSuccess: false },
      'ready to start': { isTerminal: false, isSuccess: false },
    };

    const lowerStatus = statusText.toLowerCase();
    const statusInfo = terminalStates[lowerStatus] ?? { isTerminal: false, isSuccess: false };
    const result = {
      status: statusText,
      percentage,
      isTerminal: statusInfo.isTerminal,
      isSuccess: statusInfo.isSuccess,
    };

    if (process.env.DEBUG_MIGRATION === 'true') {
      console.log(`[DEBUG] Status lookup result: ${JSON.stringify(result)}`);
    }

    return result;
  }

  async renameVMs(planData: PlanTestData): Promise<void> {
    const vmsToRename =
      planData.virtualMachines?.filter((vm) => vm.targetName && vm.targetName !== vm.sourceName) ??
      [];

    // eslint-disable-next-line no-restricted-syntax
    if (vmsToRename.length === 0) {
      return;
    }

    await this.virtualMachinesTab.navigateToVirtualMachinesTab();

    await this.virtualMachinesTab.verifyVirtualMachinesTab(planData);

    for (const vm of vmsToRename) {
      if (vm.targetName) {
        await this.virtualMachinesTab.renameVM(vm.sourceName, vm.targetName);
      }
    }
  }

  async verifyBasicPlanDetailsPage(planData: PlanTestData) {
    await this.verifyPlanTitle(planData.planName);
    await this.verifyNavigationTabs();
    await this.detailsTab.navigateToDetailsTab();
    await this.detailsTab.verifyDetailsTab(planData);
    await this.virtualMachinesTab.navigateToVirtualMachinesTab();
    await this.virtualMachinesTab.verifyVirtualMachinesTab(planData);
  }

  async verifyBreadcrumbs() {
    await expect(this.page.getByTestId('breadcrumb-link-0')).toContainText('Plans');
    await expect(this.page.locator('.pf-v5-c-breadcrumb__item').last()).toContainText(
      'Plan Details',
    );
  }

  async verifyMigrationInProgress(): Promise<void> {
    await expect(
      this.page.locator('.forklift-page-headings__status .pf-v5-c-label__text'),
    ).not.toContainText('Ready for migration', { timeout: 30000 });

    await expect(
      this.page
        .locator('.pf-v5-c-spinner')
        .or(this.page.locator('.forklift-page-headings__status').filter({ hasText: /^\d{1,3}%$/ })),
    ).toBeVisible({ timeout: 30000 });
  }

  async verifyNavigationTabs(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await expect(detailsTab).toBeVisible();
    const virtualMachinesTab = this.page.locator(
      '[data-test-id="horizontal-link-Virtual machines"]',
    );
    await expect(virtualMachinesTab).toBeVisible();
  }

  async verifyPlanDetailsURL(planName: string) {
    await expect(this.page).toHaveURL((url) =>
      url.toString().includes(`forklift.konveyor.io~v1beta1~Plan/${planName}`),
    );
  }

  async verifyPlanStatus(expectedStatus: string): Promise<void> {
    await expect(this.page.locator('.forklift-page-headings__status')).toContainText(
      expectedStatus,
      { timeout: 30000 },
    );
  }

  async verifyPlanTitle(planName: string): Promise<void> {
    const titleLocator = this.page.getByTestId('resource-details-title');
    await expect(titleLocator).toContainText(planName, { timeout: 15000 });
  }

  async waitForMigrationCompletion(timeoutMs = 300000, logProgress = false): Promise<void> {
    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout | null = null;

    if (logProgress) {
      const checkProgress = async () => {
        const progress = await this.getMigrationProgress();
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(
          `[${new Date().toLocaleString()}] Migration progress: ${progress} (${elapsed}s elapsed)`,
        );
      };

      progressInterval = setInterval(checkProgress, 30000);
    }

    try {
      const endTime = Date.now() + timeoutMs;

      while (Date.now() < endTime) {
        const status = await this.getMigrationStatus();

        if (status.isTerminal) {
          console.log(
            `[${new Date().toLocaleString()}] Migration reached terminal state: ${status.status} (success: ${status.isSuccess})`,
          );

          if (status.isSuccess) {
            return;
          }
          throw new Error(`Migration failed with status: ${status.status}`);
        }

        await this.page.waitForTimeout(2000);
      }

      const currentStatus = await this.getMigrationStatus();
      throw new Error(
        `Migration did not complete within ${timeoutMs}ms. Current status: ${currentStatus.status}`,
      );
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }
}
