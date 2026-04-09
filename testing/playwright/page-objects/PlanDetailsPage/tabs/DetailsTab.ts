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
  readonly coldMigrationRadio: Locator;
  readonly descriptionTextbox: Locator;
  readonly editDescriptionModal: Locator;
  readonly editDiskDecryptionModal: Locator;
  readonly editMigrateSharedDisksModal: Locator;
  readonly editMigrationTypeModal: Locator;
  readonly editPowerStateModal: Locator;
  readonly editPreserveStaticIPsModal: Locator;
  readonly editSharedDisksCheckbox: Locator;
  readonly editSharedDisksModal: Locator;
  readonly guestConversionModal: GuestConversionModal;
  readonly labelsModal: TargetLabelsModal;
  readonly liveMigrationRadio: Locator;
  readonly migrateSharedDisksCheckbox: Locator;
  readonly nodeSelectorModal: TargetNodeSelectorModal;
  protected readonly page: Page;
  readonly powerStateOptionAuto: Locator;
  readonly powerStateOptionOff: Locator;
  readonly powerStateOptionOn: Locator;
  readonly preserveStaticIPsCheckbox: Locator;
  readonly saveDescriptionButton: Locator;
  readonly saveDiskDecryptionButton: Locator;
  readonly saveMigrateSharedDisksButton: Locator;
  readonly saveMigrationTypeButton: Locator;
  readonly savePowerStateButton: Locator;
  readonly savePreserveStaticIPsButton: Locator;
  readonly saveSharedDisksButton: Locator;
  readonly targetPowerStateSelect: Locator;
  readonly useNbdeClevisCheckbox: Locator;
  readonly warmMigrationRadio: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editDescriptionModal = this.page.getByRole('dialog', { name: 'Edit description' });
    this.descriptionTextbox = this.editDescriptionModal.getByRole('textbox');
    this.saveDescriptionButton = this.editDescriptionModal.getByTestId('modal-confirm-button');
    this.editMigrationTypeModal = this.page.getByTestId('edit-migration-type-modal');
    this.coldMigrationRadio = this.editMigrationTypeModal.getByTestId('migration-type-cold');
    this.liveMigrationRadio = this.editMigrationTypeModal.getByTestId('migration-type-live');
    this.warmMigrationRadio = this.editMigrationTypeModal.getByTestId('migration-type-warm');
    this.saveMigrationTypeButton = this.editMigrationTypeModal.getByTestId('modal-confirm-button');
    this.editPreserveStaticIPsModal = this.page.getByRole('dialog', { name: 'Edit static IPs' });
    this.preserveStaticIPsCheckbox = this.page.getByTestId('preserve-static-ips-checkbox');
    this.savePreserveStaticIPsButton =
      this.editPreserveStaticIPsModal.getByTestId('modal-confirm-button');
    this.editMigrateSharedDisksModal = this.page.getByRole('dialog', {
      name: 'Edit shared disks',
    });
    this.migrateSharedDisksCheckbox = this.page.getByTestId('migrate-shared-disks-checkbox');
    this.saveMigrateSharedDisksButton =
      this.editMigrateSharedDisksModal.getByTestId('modal-confirm-button');
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
    this.editSharedDisksModal = this.page.getByRole('dialog', { name: 'Edit shared disks' });
    this.editSharedDisksCheckbox = this.editSharedDisksModal.getByTestId(
      'migrate-shared-disks-checkbox',
    );
    this.saveSharedDisksButton = this.editSharedDisksModal.getByTestId('modal-confirm-button');
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

  private detailGroupByTitle(title: string): Locator {
    return this.page.getByRole('term').filter({ hasText: title }).locator('..');
  }

  private async verifyAffinityRulesCount(testId: string, count: number): Promise<void> {
    await expect(this.page.getByTestId(testId)).toContainText(`${count} affinity rule`);
  }

  private async verifyDetailItemText(testId: string, expectedText: string): Promise<void> {
    await expect(this.page.getByTestId(testId).getByText(expectedText)).toBeVisible();
  }

  private async verifyLabelsCount(testId: string, count: number): Promise<void> {
    const el = this.page.getByTestId(testId);
    if (count === 0) {
      await expect(el).toContainText('No labels defined');
    } else {
      await expect(el).not.toContainText('No labels defined');
    }
  }

  private async verifyNodeSelectorCount(testId: string, count: number): Promise<void> {
    const el = this.page.getByTestId(testId);
    if (count === 0) {
      await expect(el).toContainText('No node selectors defined');
    } else {
      await expect(el).not.toContainText('No node selectors defined');
    }
  }

  get cbtWarningAlert(): Locator {
    return this.page.getByText('Must enable Changed Block Tracking (CBT) for warm migration');
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

  async clickEditMigrateSharedDisks(): Promise<void> {
    await this.detailGroupByTitle('Shared disks').locator('dd button').last().click();
    await expect(this.editMigrateSharedDisksModal).toBeVisible();
  }

  async clickEditMigrationType(): Promise<void> {
    await this.page.getByTestId('migration-type-detail-item').locator('button').click();
    await expect(this.editMigrationTypeModal).toBeVisible();
  }

  async clickEditPreserveStaticIPs(): Promise<void> {
    await this.detailGroupByTitle('Preserve static IPs').locator('dd button').last().click();
    await expect(this.editPreserveStaticIPsModal).toBeVisible();
  }

  async clickEditSharedDisks(): Promise<void> {
    await this.page.getByTestId('shared-disks-detail-item').locator('button').click();
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
    const el = this.page.getByTestId('status-detail-item').getByTestId('plan-status-label');
    return (await el.textContent())?.trim() ?? '';
  }

  migrationTypeRadio(type: MigrationType): Locator {
    return this.editMigrationTypeModal.getByTestId(`migration-type-${type}`);
  }

  async navigateToDetailsTab(): Promise<void> {
    await this.page.locator('[data-test-id="horizontal-link-Details"]').click();
  }

  powerStateOption(state: 'on' | 'off' | 'auto'): Locator {
    const names = { auto: 'Retain source VM power state', off: 'Powered off', on: 'Powered on' };
    return this.page.getByRole('option', { name: names[state], exact: true });
  }

  async saveDescription(): Promise<void> {
    await this.saveDescriptionButton.click();
    await expect(this.editDescriptionModal).not.toBeVisible();
  }

  async saveMigrateSharedDisks(): Promise<void> {
    await this.saveMigrateSharedDisksButton.click();
    await expect(this.editMigrateSharedDisksModal).not.toBeVisible();
  }

  async saveMigrationType(): Promise<void> {
    await this.saveMigrationTypeButton.click();
    await expect(this.editMigrationTypeModal).not.toBeVisible();
  }

  async savePreserveStaticIPs(): Promise<void> {
    await this.savePreserveStaticIPsButton.click();
    await expect(this.editPreserveStaticIPsModal).not.toBeVisible();
  }

  async selectMigrationType(type: MigrationType): Promise<void> {
    await this.migrationTypeRadio(type).click();
  }

  get sharedDisksInfoAlert(): Locator {
    return this.page.getByText('This may slow down the migration process');
  }

  sharedDisksDetailItem(text: string): Locator {
    return this.page.getByTestId('shared-disks-detail-item').getByText(text, { exact: false });
  }

  targetVMPowerState(state: string): Locator {
    return this.page.getByTestId('target-vm-power-state-detail-item').getByText(state, {
      exact: true,
    });
  }

  get vddkWarningAlert(): Locator {
    return this.page.getByText('Must enable VMware Virtual Disk Development Kit');
  }

  async verifyConvertorAffinityRulesCount(count: number): Promise<void> {
    await this.verifyAffinityRulesCount('convertor-affinity-rules-detail-item', count);
  }

  async verifyConvertorAffinityText(text: string): Promise<void> {
    await this.verifyDetailItemText('convertor-affinity-rules-detail-item', text);
  }

  async verifyConvertorLabelsCount(count: number): Promise<void> {
    await this.verifyLabelsCount('convertor-labels-detail-item', count);
  }

  async verifyConvertorLabelsText(text: string): Promise<void> {
    await this.verifyDetailItemText('convertor-labels-detail-item', text);
  }

  async verifyConvertorNodeSelectorCount(count: number): Promise<void> {
    await this.verifyNodeSelectorCount('convertor-node-selector-detail-item', count);
  }

  async verifyConvertorNodeSelectorText(text: string): Promise<void> {
    await this.verifyDetailItemText('convertor-node-selector-detail-item', text);
  }

  async verifyDescriptionText(text: string): Promise<void> {
    await expect(this.page.getByTestId('description-detail-item')).toContainText(text);
  }

  async verifyDetailsTab(planData: PlanTestData): Promise<void> {
    await this.verifyNavigationTabs();
    await this.verifyPlanDetails(planData);
  }

  async verifyGuestConversionModeText(text: string): Promise<void> {
    await this.verifyDetailItemText('guest-conversion-mode-detail-item', text);
  }

  async verifyGuestConversionModeTexts(texts: string[]): Promise<void> {
    for (const text of texts) await this.verifyGuestConversionModeText(text);
  }

  async verifyMigrationType(type: MigrationType): Promise<void> {
    await expect(this.page.getByTestId('migration-type-detail-item')).toContainText(
      new RegExp(type, 'i'),
    );
  }

  async verifyNavigationTabs(): Promise<void> {
    await expect(this.page.locator('[data-test-id="horizontal-link-Details"]')).toBeVisible();
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
      await this.verifyDescriptionText(planData.description ?? 'None');
    }
    if (planData.additionalPlanSettings?.targetPowerState) {
      const labels: Record<string, string> = {
        auto: 'Retain source VM power state',
        off: 'Powered off',
        on: 'Powered on',
      };
      await expect(
        this.targetVMPowerState(labels[planData.additionalPlanSettings.targetPowerState]),
      ).toBeVisible();
    }
  }

  async verifyPlanStatus(expectedStatus = 'Ready for migration', soft = false): Promise<void> {
    const statusLocator = this.page.getByTestId('status-detail-item');

    const expectFn = expect.configure({ soft });
    await expectFn(statusLocator).not.toContainText('Unknown', { timeout: 120000 });
    if (expectedStatus === 'Ready for migration') {
      await expectFn(statusLocator.getByTestId('plan-start-button-status')).toBeVisible();
    }
  }

  async verifyPreserveStaticIPs(enabled: boolean): Promise<void> {
    const text = enabled ? 'Preserve static IPs' : 'Do not preserve static IPs';
    await expect(this.detailGroupByTitle('Preserve static IPs')).toContainText(text);
  }

  async verifySharedDisks(migrate: boolean): Promise<void> {
    const text = migrate ? 'Migrate shared disks' : 'Do not migrate shared disks';
    await expect(this.detailGroupByTitle('Shared disks')).toContainText(text);
  }

  async verifyTargetAffinityRulesCount(count: number): Promise<void> {
    await this.verifyAffinityRulesCount('vm-target-affinity-rules-detail-item', count);
  }

  async verifyTargetAffinityText(text: string): Promise<void> {
    await this.verifyDetailItemText('vm-target-affinity-rules-detail-item', text);
  }

  async verifyTargetLabelsCount(count: number): Promise<void> {
    await this.verifyLabelsCount('vm-target-labels-detail-item', count);
  }

  async verifyTargetLabelsText(text: string): Promise<void> {
    await this.verifyDetailItemText('vm-target-labels-detail-item', text);
  }

  async verifyTargetNodeSelectorCount(count: number): Promise<void> {
    await this.verifyNodeSelectorCount('vm-target-node-selector-detail-item', count);
  }

  async verifyTargetNodeSelectorText(text: string): Promise<void> {
    await this.verifyDetailItemText('vm-target-node-selector-detail-item', text);
  }
}
