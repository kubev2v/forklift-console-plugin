import { expect, type Locator, type Page } from '@playwright/test';

import type { MigrationType } from '../../../types/enums';
import type { PlanTestData } from '../../../types/test-data';
import { V2_11_0 } from '../../../utils/version/constants';
import { isVersionAtLeast } from '../../../utils/version/version';
import { GuestConversionModal } from '../modals/GuestConversionModal';
import { TargetAffinityModal } from '../modals/TargetAffinityModal';
import { TargetLabelsModal } from '../modals/TargetLabelsModal';
import { TargetNodeSelectorModal } from '../modals/TargetNodeSelectorModal';

export class DetailsTab {
  readonly affinityModal: TargetAffinityModal;
  readonly descriptionTextbox: Locator;
  readonly editDescriptionModal: Locator;
  readonly editDiskDecryptionModal: Locator;
  readonly editMigrationTypeModal: Locator;
  readonly editPowerStateModal: Locator;
  readonly guestConversionModal: GuestConversionModal;
  readonly labelsModal: TargetLabelsModal;
  readonly nodeSelectorModal: TargetNodeSelectorModal;
  protected readonly page: Page;
  readonly powerStateOptionAuto: Locator;
  readonly powerStateOptionOff: Locator;
  readonly powerStateOptionOn: Locator;
  readonly saveDescriptionButton: Locator;
  readonly saveDiskDecryptionButton: Locator;
  readonly saveMigrationTypeButton: Locator;
  readonly savePowerStateButton: Locator;
  readonly targetPowerStateSelect: Locator;
  readonly useNbdeClevisCheckbox: Locator;
  readonly warmMigrationSwitch: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editDescriptionModal = this.page.getByRole('dialog', { name: 'Edit description' });
    this.descriptionTextbox = this.editDescriptionModal.getByRole('textbox');
    this.saveDescriptionButton = this.editDescriptionModal.getByTestId('modal-confirm-button');
    this.editMigrationTypeModal = this.page.getByTestId('edit-migration-type-modal');
    this.warmMigrationSwitch = this.editMigrationTypeModal.getByRole('switch');
    this.saveMigrationTypeButton = this.editMigrationTypeModal.getByTestId('modal-confirm-button');
    this.editPowerStateModal = this.page.getByTestId('edit-target-power-state-modal');
    this.savePowerStateButton = this.page.getByTestId('modal-confirm-button');
    this.targetPowerStateSelect = this.editPowerStateModal.getByTestId('target-power-state-select');
    this.powerStateOptionAuto = this.page.getByRole('option', {
      name: 'Retain source VM power state',
      exact: true,
    });
    this.powerStateOptionOn = this.page.getByRole('option', { name: 'Powered on', exact: true });
    this.powerStateOptionOff = this.page.getByRole('option', { name: 'Powered off', exact: true });
    this.editDiskDecryptionModal = this.page.getByRole('dialog', { name: 'Disk decryption' });
    this.useNbdeClevisCheckbox = this.page.getByTestId('use-nbde-clevis-checkbox');
    this.saveDiskDecryptionButton = this.page.getByTestId('modal-confirm-button');
    this.guestConversionModal = new GuestConversionModal(page);
    this.labelsModal = new TargetLabelsModal(page);
    this.nodeSelectorModal = new TargetNodeSelectorModal(page);
    this.affinityModal = new TargetAffinityModal(page);
  }

  private async clickEditDetailItem(
    testId: string,
    modal: { waitForModalToOpen: () => Promise<void> },
  ): Promise<void> {
    await this.page.getByTestId(testId).locator('button').click();
    await modal.waitForModalToOpen();
  }

  private async verifyAffinityRulesCount(testId: string, count: number): Promise<void> {
    const element = this.page.getByTestId(testId);
    await expect(element).toContainText(`${count} affinity rule`);
  }

  private async verifyDetailItemText(testId: string, expectedText: string): Promise<void> {
    const text = this.page.getByTestId(testId).getByText(expectedText);
    await expect(text).toBeVisible();
  }

  private async verifyLabelsCount(testId: string, count: number): Promise<void> {
    const element = this.page.getByTestId(testId);
    if (count === 0) {
      await expect(element).toContainText('No labels defined');
    } else {
      await expect(element).not.toContainText('No labels defined');
    }
  }

  private async verifyNodeSelectorCount(testId: string, count: number): Promise<void> {
    const element = this.page.getByTestId(testId);
    if (count === 0) {
      await expect(element).toContainText('No node selectors defined');
    } else {
      await expect(element).not.toContainText('No node selectors defined');
    }
  }

  async clickEditConvertorAffinity(): Promise<void> {
    await this.clickEditDetailItem('convertor-affinity-rules-detail-item', this.affinityModal);
  }

  async clickEditConvertorLabels(): Promise<void> {
    await this.clickEditDetailItem('convertor-labels-detail-item', this.labelsModal);
  }

  async clickEditConvertorNodeSelector(): Promise<void> {
    await this.clickEditDetailItem('convertor-node-selector-detail-item', this.nodeSelectorModal);
  }

  async clickEditDescription(): Promise<void> {
    await this.page.getByTestId('description-detail-item').locator('button').click();
    await expect(this.editDescriptionModal).toBeVisible();
  }

  async clickEditDiskDecryption(): Promise<void> {
    await this.page.getByTestId('disk-decryption-detail-item').locator('button').click();
  }

  async clickEditGuestConversionMode(): Promise<void> {
    await this.clickEditDetailItem('guest-conversion-mode-detail-item', this.guestConversionModal);
  }

  async clickEditMigrationType(): Promise<void> {
    await this.page.getByTestId('migration-type-detail-item').locator('button').click();
    await expect(this.editMigrationTypeModal).toBeVisible();
  }

  async clickEditTargetAffinity(): Promise<void> {
    await this.clickEditDetailItem('vm-target-affinity-rules-detail-item', this.affinityModal);
  }

  async clickEditTargetLabels(): Promise<void> {
    await this.clickEditDetailItem('vm-target-labels-detail-item', this.labelsModal);
  }

  async clickEditTargetNodeSelector(): Promise<void> {
    await this.clickEditDetailItem('vm-target-node-selector-detail-item', this.nodeSelectorModal);
  }

  async clickEditTargetVMPowerState(): Promise<void> {
    await this.page.getByTestId('target-vm-power-state-detail-item').locator('button').click();
  }

  diskDecryptionDetailItem(): Locator {
    return this.page.getByTestId('disk-decryption-detail-item');
  }

  async editDescription(newDescription: string): Promise<void> {
    await this.descriptionTextbox.fill(newDescription);
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
    const optionNames = {
      auto: 'Retain source VM power state',
      on: 'Powered on',
      off: 'Powered off',
    };
    return this.page.getByRole('option', { name: optionNames[state], exact: true });
  }

  async saveDescription(): Promise<void> {
    await this.saveDescriptionButton.click();
    await expect(this.editDescriptionModal).not.toBeVisible();
  }

  async saveMigrationType(): Promise<void> {
    await this.saveMigrationTypeButton.click();
    await expect(this.editMigrationTypeModal).not.toBeVisible();
  }

  async setWarmMigration(isWarm: boolean): Promise<void> {
    await this.warmMigrationSwitch.setChecked(isWarm, { force: true });
  }

  targetVMPowerState(state: string): Locator {
    return this.page
      .getByTestId('target-vm-power-state-detail-item')
      .getByText(state, { exact: true });
  }

  get vddkWarningAlert(): Locator {
    return this.page.getByText('Must enable VMware Virtual Disk Development Kit');
  }

  async verifyConvertorAffinityRulesCount(count: number): Promise<void> {
    await this.verifyAffinityRulesCount('convertor-affinity-rules-detail-item', count);
  }

  async verifyConvertorAffinityText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('convertor-affinity-rules-detail-item', expectedText);
  }

  async verifyConvertorLabelsCount(count: number): Promise<void> {
    await this.verifyLabelsCount('convertor-labels-detail-item', count);
  }

  async verifyConvertorLabelsText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('convertor-labels-detail-item', expectedText);
  }

  async verifyConvertorNodeSelectorCount(count: number): Promise<void> {
    await this.verifyNodeSelectorCount('convertor-node-selector-detail-item', count);
  }

  async verifyConvertorNodeSelectorText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('convertor-node-selector-detail-item', expectedText);
  }

  async verifyDescriptionText(expectedText: string): Promise<void> {
    const descriptionElement = this.page.getByTestId('description-detail-item');
    await expect(descriptionElement).toContainText(expectedText);
  }

  async verifyDetailsTab(planData: PlanTestData): Promise<void> {
    await this.verifyNavigationTabs();
    await this.verifyPlanDetails(planData);
    await this.verifyPlanStatus();
  }

  async verifyGuestConversionModeText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('guest-conversion-mode-detail-item', expectedText);
  }

  async verifyGuestConversionModeTexts(texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.verifyGuestConversionModeText(text);
    }
  }

  async verifyMigrationType(type: MigrationType): Promise<void> {
    await expect(this.page.getByTestId('migration-type-detail-item')).toContainText(
      new RegExp(type, 'i'),
    );
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

    if (isVersionAtLeast(V2_11_0)) {
      if (planData.description) {
        await this.verifyDescriptionText(planData.description);
      } else {
        await this.verifyDescriptionText('None');
      }
    }

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

  async verifyPlanStatus(expectedStatus = 'Ready for migration', soft = false): Promise<void> {
    const statusLocator = this.page.getByTestId('status-detail-item');
    const expectFn = expect.configure({ soft });

    await expectFn(statusLocator).not.toContainText('Unknown', { timeout: 30000 });

    if (expectedStatus === 'Ready for migration') {
      await expectFn(
        this.page.getByTestId('status-detail-item').getByTestId('plan-start-button-status'),
      ).toBeVisible();
    }
  }

  async verifyTargetAffinityRulesCount(count: number): Promise<void> {
    await this.verifyAffinityRulesCount('vm-target-affinity-rules-detail-item', count);
  }

  async verifyTargetAffinityText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('vm-target-affinity-rules-detail-item', expectedText);
  }

  async verifyTargetLabelsCount(count: number): Promise<void> {
    await this.verifyLabelsCount('vm-target-labels-detail-item', count);
  }

  async verifyTargetLabelsText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('vm-target-labels-detail-item', expectedText);
  }

  async verifyTargetNodeSelectorCount(count: number): Promise<void> {
    await this.verifyNodeSelectorCount('vm-target-node-selector-detail-item', count);
  }

  async verifyTargetNodeSelectorText(expectedText: string): Promise<void> {
    await this.verifyDetailItemText('vm-target-node-selector-detail-item', expectedText);
  }
}
