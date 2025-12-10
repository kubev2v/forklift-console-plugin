import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { isEmpty } from '../../utils/utils';

import { DetailsTab } from './tabs/DetailsTab';
import { MappingsTab } from './tabs/MappingsTab';
import { VirtualMachinesTab } from './tabs/VirtualMachinesTab';

export class PlanDetailsPage {
  private readonly navigation: NavigationHelper;
  public readonly detailsTab: DetailsTab;
  public readonly mappingsTab: MappingsTab;
  protected readonly page: Page;
  public readonly virtualMachinesTab: VirtualMachinesTab;

  constructor(page: Page) {
    this.page = page;
    this.detailsTab = new DetailsTab(page);
    this.mappingsTab = new MappingsTab(page);
    this.navigation = new NavigationHelper(page);
    this.virtualMachinesTab = new VirtualMachinesTab(page);
  }

  async clickActionsMenuAndStart(): Promise<void> {
    await this.page.getByTestId('plan-actions-dropdown-button').click();
    await this.page.getByTestId('plan-actions-start-menuitem').click();
    await this.page.getByTestId('modal-confirm-button').click();
  }

  async clickStartButtonInStatus(): Promise<void> {
    await this.page.getByTestId('plan-start-button-status').click();
    await this.page.getByTestId('modal-confirm-button').click();
  }

  async getMigrationProgress(): Promise<string> {
    const statusContainer = this.page.getByTestId('plan-status-container');
    const statusElement = statusContainer.locator('[data-testid^="plan-status-"]').first();
    const labelText = await statusElement.textContent();
    const statusText = labelText?.trim() ?? '';

    let percentage = '';
    try {
      const percentageElement = this.page.getByTestId('plan-progress-percentage');
      const isPercentageVisible = await percentageElement.isVisible({ timeout: 1000 });
      if (isPercentageVisible) {
        const percentageText = await percentageElement.textContent({ timeout: 2000 });
        if (percentageText) {
          percentage = ` (${percentageText.trim()})`;
        }
      }
    } catch {
      // Percentage not available
    }

    return `${statusText}${percentage}`;
  }

  async getMigrationStatus(): Promise<{
    status: string;
    percentage: string;
    isTerminal: boolean;
    isSuccess: boolean;
  }> {
    const statusContainer = this.page.getByTestId('plan-status-container');
    const statusElement = statusContainer.locator('[data-testid^="plan-status-"]').first();
    const statusText = (await statusElement.textContent())?.trim() ?? '';
    let percentage = 'N/A';
    try {
      const percentageElement = this.page.getByTestId('plan-progress-percentage');
      const isPercentageVisible = await percentageElement.isVisible({ timeout: 1000 });
      if (isPercentageVisible) {
        const percentageText = await percentageElement.textContent({ timeout: 2000 });
        if (percentageText) {
          percentage = percentageText.replace('%', '').trim();
        }
      }
    } catch {
      // Percentage not available
    }

    const terminalStates: Record<string, { isTerminal: boolean; isSuccess: boolean }> = {
      complete: { isTerminal: true, isSuccess: true },
      incomplete: { isTerminal: true, isSuccess: false },
      canceled: { isTerminal: true, isSuccess: false },
      'cannot start': { isTerminal: true, isSuccess: false },
      archived: { isTerminal: true, isSuccess: false },
      'migration running': { isTerminal: false, isSuccess: false },
      'ready for migration': { isTerminal: false, isSuccess: false },
      paused: { isTerminal: false, isSuccess: false },
      unknown: { isTerminal: false, isSuccess: false },
    };

    const lowerStatus = statusText.toLowerCase();
    const statusInfo = terminalStates[lowerStatus] ?? { isTerminal: false, isSuccess: false };
    return {
      status: statusText,
      percentage,
      isTerminal: statusInfo.isTerminal,
      isSuccess: statusInfo.isSuccess,
    };
  }

  async navigate(planName: string, namespace: string): Promise<void> {
    await this.navigation.navigateToK8sResource({
      resource: 'Plan',
      name: planName,
      namespace,
    });
  }

  async renameVMs(planData: PlanTestData): Promise<void> {
    const vmsToRename =
      planData.virtualMachines?.filter((vm) => vm.targetName && vm.targetName !== vm.sourceName) ??
      [];

    if (isEmpty(vmsToRename)) {
      return;
    }

    await this.virtualMachinesTab.navigateToVirtualMachinesTab();

    await this.virtualMachinesTab.verifyVirtualMachinesTab(planData);

    for (const vm of vmsToRename) {
      if (vm.targetName && vm.sourceName) {
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
    await expect(this.page.getByTestId('breadcrumb-item-1')).toContainText('Plan Details');
  }

  async verifyMigrationInProgress(): Promise<void> {
    await expect(this.page.getByTestId('plan-status-container')).not.toContainText(
      'Ready for migration',
      { timeout: 30000 },
    );

    await expect(this.page.getByTestId('plan-progress-spinner')).toBeVisible({ timeout: 30000 });
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

  async verifyPlanStatus(expectedStatus: string, soft = false): Promise<void> {
    await this.detailsTab.verifyPlanStatus(expectedStatus, soft);
  }

  async verifyPlanTitle(planName: string): Promise<void> {
    const titleLocator = this.page.getByTestId('resource-details-title');
    await expect(titleLocator).toContainText(planName);
  }

  async waitForMigrationCompletion(timeoutMs = 300000, logProgress = false): Promise<void> {
    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout | null = null;

    if (logProgress) {
      const checkProgress = async () => {
        const progress = await this.getMigrationProgress();
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`Migration progress: ${progress} (${elapsed}s elapsed)`);
      };

      progressInterval = setInterval(checkProgress, 30000);
    }

    try {
      const endTime = Date.now() + timeoutMs;

      while (Date.now() < endTime) {
        const status = await this.getMigrationStatus();

        if (status.isTerminal) {
          console.log(`Migration completed: ${status.status} (success: ${status.isSuccess})`);

          if (status.isSuccess) {
            return;
          }
          throw new Error(`Migration failed with status: ${status.status}`);
        }

        await this.page.waitForTimeout(2000);
      }

      const currentStatus = await this.getMigrationStatus();
      throw new Error(`Migration timeout after ${timeoutMs}ms. Status: ${currentStatus.status}`);
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }
}
