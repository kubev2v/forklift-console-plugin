import { expect, type Locator, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';
import { GuestConversionModal } from '../modals/GuestConversionModal';
import { TargetAffinityModal } from '../modals/TargetAffinityModal';
import { TargetLabelsModal } from '../modals/TargetLabelsModal';
import { TargetNodeSelectorModal } from '../modals/TargetNodeSelectorModal';

export class DetailsTab {
  readonly editPowerStateModal: Locator;
  readonly guestConversionModal: GuestConversionModal;
  protected readonly page: Page;
  readonly powerStateOptionAuto: Locator;
  readonly powerStateOptionOff: Locator;
  readonly powerStateOptionOn: Locator;
  readonly savePowerStateButton: Locator;
  readonly targetAffinityModal: TargetAffinityModal;
  readonly targetLabelsModal: TargetLabelsModal;
  readonly targetNodeSelectorModal: TargetNodeSelectorModal;
  readonly targetPowerStateSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editPowerStateModal = this.page.getByRole('dialog', { name: 'Edit target power state' });
    this.savePowerStateButton = this.editPowerStateModal.getByRole('button', { name: 'Save' });
    this.targetPowerStateSelect = this.editPowerStateModal.getByTestId('target-power-state-select');
    this.powerStateOptionAuto = this.editPowerStateModal.getByTestId('power-state-option-auto');
    this.powerStateOptionOn = this.editPowerStateModal.getByTestId('power-state-option-on');
    this.powerStateOptionOff = this.editPowerStateModal.getByTestId('power-state-option-off');
    this.guestConversionModal = new GuestConversionModal(page);
    this.targetLabelsModal = new TargetLabelsModal(page);
    this.targetNodeSelectorModal = new TargetNodeSelectorModal(page);
    this.targetAffinityModal = new TargetAffinityModal(page);
  }

  async clickEditGuestConversionMode(): Promise<void> {
    await this.page.getByTestId('guest-conversion-mode-detail-item').locator('button').click();
    await this.guestConversionModal.waitForModalToOpen();
  }

  async clickEditTargetAffinity(): Promise<void> {
    await this.page.getByTestId('vm-target-affinity-rules-detail-item').locator('button').click();
    await this.targetAffinityModal.waitForModalToOpen();
  }

  async clickEditTargetLabels(): Promise<void> {
    await this.page.getByTestId('vm-target-labels-detail-item').locator('button').click();
    await this.targetLabelsModal.waitForModalToOpen();
  }

  async clickEditTargetNodeSelector(): Promise<void> {
    await this.page.getByTestId('vm-target-node-selector-detail-item').locator('button').click();
    await this.targetNodeSelectorModal.waitForModalToOpen();
  }

  async clickEditTargetVMPowerState(): Promise<void> {
    await this.page.getByTestId('target-vm-power-state-detail-item').locator('button').click();
  }

  async getCurrentPlanStatus(): Promise<string> {
    const statusElement = this.page
      .getByTestId('status-detail-item')
      .getByTestId('plan-status-label');
    const statusText = await statusElement.textContent();
    return statusText?.trim() ?? '';
  }

  async navigateToDetailsTab(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await detailsTab.click();
  }

  powerStateOption(state: 'on' | 'off' | 'auto'): Locator {
    return this.editPowerStateModal.getByTestId(`power-state-option-${state}`);
  }

  targetVMPowerState(state: string): Locator {
    return this.page
      .getByTestId('target-vm-power-state-detail-item')
      .getByText(state, { exact: true });
  }

  async verifyDetailsTab(planData: PlanTestData): Promise<void> {
    await this.verifyNavigationTabs();
    await this.verifyPlanDetails(planData);
    await this.verifyPlanStatus();
  }

  async verifyGuestConversionModeText(expectedText: string): Promise<void> {
    const guestConversionText = this.page
      .getByTestId('guest-conversion-mode-detail-item')
      .getByText(expectedText);
    await expect(guestConversionText).toBeVisible();
  }

  async verifyGuestConversionModeTexts(texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.verifyGuestConversionModeText(text);
    }
  }

  async verifyNavigationTabs(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await expect(detailsTab).toBeVisible();
  }

  async verifyPlanDetails(planData: PlanTestData): Promise<void> {
    await expect(this.page.getByTestId('name-detail-item')).toContainText(planData.planName ?? '');
    await expect(this.page.getByTestId('project-detail-item')).toContainText(
      planData.planProject ?? '',
    );
    await expect(this.page.getByTestId('target-project-detail-item')).toContainText(
      planData.targetProject?.name ?? '',
    );
    await expect(this.page.getByTestId('created-at-detail-item')).toBeVisible();
    await expect(this.page.getByTestId('owner-detail-item')).toContainText('No owner');

    if (planData.additionalPlanSettings?.targetPowerState) {
      let powerState = 'Retain source VM power state';
      if (planData.additionalPlanSettings.targetPowerState === 'on') {
        powerState = 'Powered on';
      } else if (planData.additionalPlanSettings.targetPowerState === 'off') {
        powerState = 'Powered off';
      }
      await expect(this.targetVMPowerState(powerState)).toBeVisible();
    }
  }

  async verifyPlanStatus(expectedStatus = 'Ready for migration'): Promise<void> {
    const statusLocator = this.page.getByTestId('status-detail-item');

    await expect(statusLocator).not.toContainText('Unknown', { timeout: 30000 });

    if (expectedStatus === 'Ready for migration') {
      await expect(
        this.page.getByTestId('status-detail-item').getByTestId('plan-start-button-status'),
      ).toBeVisible();
    }
  }

  async verifyTargetAffinityRulesCount(count: number): Promise<void> {
    const targetAffinityElement = this.page.getByTestId('vm-target-affinity-rules-detail-item');
    await expect(targetAffinityElement).toContainText(`${count} affinity rule`, { timeout: 15000 });
  }

  async verifyTargetAffinityText(expectedText: string): Promise<void> {
    const targetAffinityText = this.page
      .getByTestId('vm-target-affinity-rules-detail-item')
      .getByText(expectedText);
    await expect(targetAffinityText).toBeVisible();
  }

  async verifyTargetLabelsCount(count: number): Promise<void> {
    const targetLabelsElement = this.page.getByTestId('vm-target-labels-detail-item');
    if (count === 0) {
      await expect(targetLabelsElement).toContainText('No labels defined');
    } else {
      await expect(targetLabelsElement).not.toContainText('No labels defined');
    }
  }

  async verifyTargetLabelsText(expectedText: string): Promise<void> {
    const targetLabelsText = this.page
      .getByTestId('vm-target-labels-detail-item')
      .getByText(expectedText);
    await expect(targetLabelsText).toBeVisible();
  }

  async verifyTargetNodeSelectorCount(count: number): Promise<void> {
    const targetNodeSelectorElement = this.page.getByTestId('vm-target-node-selector-detail-item');
    if (count === 0) {
      await expect(targetNodeSelectorElement).toContainText('No node selectors defined');
    } else {
      await expect(targetNodeSelectorElement).not.toContainText('No node selectors defined', {
        timeout: 15000,
      });
    }
  }

  async verifyTargetNodeSelectorText(expectedText: string): Promise<void> {
    const targetNodeSelectorText = this.page
      .getByTestId('vm-target-node-selector-detail-item')
      .getByText(expectedText);
    await expect(targetNodeSelectorText).toBeVisible();
  }
}
