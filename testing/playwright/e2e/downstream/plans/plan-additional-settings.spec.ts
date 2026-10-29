import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { DOWNSTREAM_PLAN_UI_TIMEOUT_MS } from '../../../utils/resource-manager/constants';
import { V2_11_0, V2_12_0 } from '../../../utils/version/constants';
import { isVersionAtLeast, requireVersion } from '../../../utils/version/version';

test.describe('Plan additional settings', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });

  test('should set power state on plan creation, plan details tab, and VMs tab', async ({
    page,
    resourceManager,
    testProvider,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      additionalPlanSettings: {
        targetPowerState: 'on',
      },
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToAdditionalSettings(testData);

    const { additionalSettings } = wizard;
    await additionalSettings.verifyStepVisible();
    await additionalSettings.targetPowerStateSelect.click();
    await expect(additionalSettings.powerStateOptionAuto).toHaveText(
      'Retain source VM power state',
    );
    await expect(additionalSettings.powerStateOptionOn).toHaveText('Powered on');
    await expect(additionalSettings.powerStateOptionOff).toHaveText('Powered off');
    await additionalSettings
      .powerStateOption(testData.additionalPlanSettings?.targetPowerState ?? 'on')
      .click();
    await wizard.clickSkipToReview();

    await wizard.review.verifyReviewStep(testData);
    await wizard.clickNext();
    await wizard.waitForPlanCreation();

    const planDetailsPage = new PlanDetailsPage(page);
    const { settingsTab } = planDetailsPage;
    await settingsTab.navigateToTargetVmSection();
    await expect(settingsTab.targetVMPowerState('Powered on')).toBeVisible();
    await settingsTab.clickEditTargetVMPowerState();
    await expect(settingsTab.editPowerStateModal).toBeVisible();
    await expect(settingsTab.savePowerStateButton).toBeDisabled();
    await settingsTab.targetPowerStateSelect.click();
    await expect(settingsTab.powerStateOptionAuto).toHaveText('Retain source VM power state');
    await expect(settingsTab.powerStateOptionOn).toHaveText('Powered on');
    await expect(settingsTab.powerStateOptionOff).toHaveText('Powered off');

    await settingsTab.powerStateOption('off').click();
    await expect(settingsTab.savePowerStateButton).toBeEnabled();
    await settingsTab.savePowerStateButton.click();
    await expect(settingsTab.targetVMPowerState('Powered off')).toBeVisible();

    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

    const { virtualMachinesTab } = planDetailsPage;
    await virtualMachinesTab.enableColumn('Target power state');
    expect(await virtualMachinesTab.isColumnVisible('Target power state')).toBe(true);

    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
    expect(await virtualMachinesTab.getVMPowerState(vmName)).toBe(
      'Powered off (Inherited from plan)',
    );

    await virtualMachinesTab.openPowerStateDialog(vmName);
    await virtualMachinesTab.editVmWizard.advanceToReviewStep();
    await expect(virtualMachinesTab.powerStateModalSaveButton).toBeDisabled();
    await virtualMachinesTab.editVmWizard.navigateToGeneralStep();
    await virtualMachinesTab.powerStateModalSelect.click();
    await expect(virtualMachinesTab.powerStateOptionInherit).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionInherit).toContainText('Set to: Powered off');
    await expect(virtualMachinesTab.powerStateOptionAuto).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionOn).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionOff).toBeVisible();

    await virtualMachinesTab.powerStateOptionOn.click();
    await virtualMachinesTab.saveEditVmWizard();

    await expect(virtualMachinesTab.editTargetPowerStateModal).not.toBeVisible();
    await planDetailsPage.virtualMachinesTab.waitForVMPowerState(vmName, 'Powered on');
  });

  test('should edit shared disks on plan details and override per-VM', async ({
    page,
    resourceManager,
    testProvider,
  }, testInfo) => {
    testInfo.skip(!isVersionAtLeast(V2_12_0), 'Shared disks requires Forklift 2.12.0+');
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToAdditionalSettings(testData);
    await wizard.clickSkipToReview();
    await wizard.review.verifyReviewStep(testData);
    await wizard.clickNext();
    await wizard.waitForPlanCreation();

    const planDetailsPage = new PlanDetailsPage(page);
    const { settingsTab, virtualMachinesTab: vmt } = planDetailsPage;
    await settingsTab.navigateToGuestSection();
    await expect(settingsTab.sharedDisksDetailItem('Migrate shared disks')).toBeVisible();

    await settingsTab.clickEditSharedDisks();
    await expect(settingsTab.editSharedDisksModal).toBeVisible();
    await settingsTab.editSharedDisksCheckbox.uncheck();
    await expect(settingsTab.editSharedDisksCheckbox).not.toBeChecked();
    await settingsTab.saveSharedDisksButton.click();
    await expect(settingsTab.editSharedDisksModal).not.toBeVisible();
    await expect(settingsTab.sharedDisksDetailItem('Do not migrate shared disks')).toBeVisible();

    await vmt.navigateToVirtualMachinesTab();
    await vmt.enableColumn('Shared disks');
    expect(await vmt.isColumnVisible('Shared disks')).toBe(true);

    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
    expect(await vmt.getVMSharedDisks(vmName)).toBe(
      'Do not migrate shared disks (Inherited from plan)',
    );
    await vmt.openSharedDisksDialog(vmName);
    await vmt.editVmWizard.advanceToReviewStep();
    await expect(vmt.sharedDisksModalSaveButton).toBeDisabled();
    await vmt.editVmWizard.navigateToDisksStep();
    await expect(vmt.sharedDisksOptionInherit).toBeVisible();
    await expect(vmt.sharedDisksOptionEnabled).toBeVisible();
    await expect(vmt.sharedDisksOptionDisabled).toBeVisible();

    await vmt.sharedDisksOptionEnabled.click();
    await vmt.saveEditVmWizard();
    await expect(vmt.editSharedDisksModal).not.toBeVisible();
    await vmt.waitForVMSharedDisks(vmName, 'Migrate shared disks');

    await vmt.openSharedDisksDialog(vmName);
    await vmt.sharedDisksOptionInherit.click();
    await vmt.saveEditVmWizard();
    await expect(vmt.editSharedDisksModal).not.toBeVisible();
    await vmt.waitForVMSharedDisks(vmName, 'Do not migrate shared disks (Inherited from plan)');
  });

  test('should set NBDE/Clevis on plan creation and edit from details page', async ({
    page,
    resourceManager,
    testProvider,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      additionalPlanSettings: {
        useNbdeClevis: true,
      },
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    // Step 1: Navigate to Additional Settings
    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToAdditionalSettings(testData);

    // Step 2: Enable NBDE/Clevis during plan creation
    const { additionalSettings } = wizard;
    await additionalSettings.verifyStepVisible();
    await expect(additionalSettings.useNbdeClevisCheckbox).toBeVisible();
    await additionalSettings.useNbdeClevisCheckbox.check();
    await expect(additionalSettings.useNbdeClevisCheckbox).toBeChecked();

    await wizard.clickSkipToReview();

    // Step 3: Create plan and navigate to Details tab
    await wizard.review.verifyReviewStep(testData);
    await wizard.clickNext();
    await wizard.waitForPlanCreation();

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.settingsTab.navigateToGuestSection();
    await expect(planDetailsPage.settingsTab.diskDecryptionDetailItem()).toBeVisible();

    // Step 4: Edit disk decryption from Settings tab
    await planDetailsPage.settingsTab.clickEditDiskDecryption();
    await expect(planDetailsPage.settingsTab.editDiskDecryptionModal).toBeVisible();
    await expect(planDetailsPage.settingsTab.useNbdeClevisCheckbox).toBeVisible();

    // Step 5: Test checkbox toggle functionality
    await planDetailsPage.settingsTab.useNbdeClevisCheckbox.check();
    await expect(planDetailsPage.settingsTab.useNbdeClevisCheckbox).toBeChecked();
    await planDetailsPage.settingsTab.useNbdeClevisCheckbox.uncheck();
    await expect(planDetailsPage.settingsTab.useNbdeClevisCheckbox).not.toBeChecked();
    await planDetailsPage.settingsTab.useNbdeClevisCheckbox.check();
    await expect(planDetailsPage.settingsTab.useNbdeClevisCheckbox).toBeChecked();

    // Step 6: Save disk decryption changes
    await expect(planDetailsPage.settingsTab.saveDiskDecryptionButton).toBeEnabled();
    await planDetailsPage.settingsTab.saveDiskDecryptionButton.click();
    await expect(planDetailsPage.settingsTab.editDiskDecryptionModal).not.toBeVisible();
  });
});

test.describe('Plan additional settings - PR #2292', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);
  test.describe.configure({ timeout: DOWNSTREAM_PLAN_UI_TIMEOUT_MS });

  test('should edit preserve static IPs and shared disks from details page', async ({
    page,
    resourceManager,
    testProvider,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    await test.step('Create plan via wizard', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.fillAndSubmit(testData);
    });

    const { settingsTab } = new PlanDetailsPage(page);
    await settingsTab.navigateToTransferSection();

    await test.step('Verify preserve static IPs default is enabled (vSphere)', async () => {
      await settingsTab.verifyPreserveStaticIPs(true);
    });

    await test.step('Disable preserve static IPs', async () => {
      await settingsTab.clickEditPreserveStaticIPs();
      await expect(settingsTab.preserveStaticIPsCheckbox).toBeChecked();
      await settingsTab.preserveStaticIPsCheckbox.uncheck();
      await expect(settingsTab.preserveStaticIPsCheckbox).not.toBeChecked();
      await settingsTab.savePreserveStaticIPs();
      await settingsTab.verifyPreserveStaticIPs(false);
    });

    await test.step('Re-enable preserve static IPs', async () => {
      await settingsTab.clickEditPreserveStaticIPs();
      await settingsTab.preserveStaticIPsCheckbox.check();
      await expect(settingsTab.preserveStaticIPsCheckbox).toBeChecked();
      await settingsTab.savePreserveStaticIPs();
      await settingsTab.verifyPreserveStaticIPs(true);
    });

    await test.step('Enable shared disks migration', async () => {
      await settingsTab.navigateToGuestSection();
      await settingsTab.clickEditMigrateSharedDisks();
      await settingsTab.migrateSharedDisksCheckbox.check();
      await expect(settingsTab.migrateSharedDisksCheckbox).toBeChecked();
      await expect(settingsTab.sharedDisksInfoAlert).toBeVisible();
      await settingsTab.saveMigrateSharedDisks();
      await settingsTab.verifySharedDisks(true);
    });

    await test.step('Disable shared disks migration', async () => {
      await settingsTab.clickEditMigrateSharedDisks();
      await expect(settingsTab.migrateSharedDisksCheckbox).toBeChecked();
      await settingsTab.migrateSharedDisksCheckbox.uncheck();
      await expect(settingsTab.migrateSharedDisksCheckbox).not.toBeChecked();
      await expect(settingsTab.sharedDisksInfoAlert).not.toBeVisible();
      await settingsTab.saveMigrateSharedDisks();
      await settingsTab.verifySharedDisks(false);
    });
  });

  test('should show validation error when selecting warm migration with provider without VDDK', async ({
    createCustomProvider,
    page,
    resourceManager,
  }) => {
    // Create a provider without VDDK image
    const providerWithoutVddk = await createCustomProvider({
      customProviderData: {
        skipVddk: true,
      },
      namePrefix: 'vddk-validation-test',
      providerKey: 'vsphere-8.0.1',
    });

    const testData: PlanTestData = createPlanTestData({
      sourceProvider: providerWithoutVddk?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToMigrationTypeStep(testData);

    await test.step('Verify cold migration is default with no VDDK warning', async () => {
      await wizard.migrationType.verifyStepVisible();
      await expect(wizard.migrationType.coldMigrationRadio).toBeChecked();
      await expect(wizard.migrationType.vddkWarningAlert).not.toBeVisible();
    });

    await test.step('Select warm migration and verify VDDK warning appears', async () => {
      await wizard.migrationType.selectMigrationType(MigrationType.WARM);
      await expect(wizard.migrationType.warmMigrationRadio).toBeChecked();
      await expect(wizard.migrationType.vddkWarningAlert).toBeVisible();
    });

    await test.step('Switch back to cold and verify warning disappears', async () => {
      await wizard.migrationType.selectMigrationType(MigrationType.COLD);
      await expect(wizard.migrationType.coldMigrationRadio).toBeChecked();
      await expect(wizard.migrationType.vddkWarningAlert).not.toBeVisible();
    });

    await test.step('Create the plan', async () => {
      await wizard.clickNext();
      await wizard.clickSkipToReview();
      await wizard.review.verifyReviewStep(testData);
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
    });

    const { detailsTab } = new PlanDetailsPage(page);

    await test.step('Verify cold migration on details page', async () => {
      await detailsTab.navigateToDetailsTab();
      await detailsTab.verifyMigrationType(MigrationType.COLD);
    });

    await test.step('Edit to warm and verify VDDK warning in modal', async () => {
      await detailsTab.clickEditMigrationType();
      await expect(detailsTab.editMigrationTypeModal).toBeVisible();
      await expect(detailsTab.migrationTypeRadio(MigrationType.COLD)).toBeChecked();
      await detailsTab.selectMigrationType(MigrationType.WARM);
      await expect(detailsTab.migrationTypeRadio(MigrationType.WARM)).toBeChecked();
      await expect(detailsTab.vddkWarningAlert).toBeVisible();
    });

    await test.step('Switch to cold and verify warning clears', async () => {
      await detailsTab.selectMigrationType(MigrationType.COLD);
      await expect(detailsTab.migrationTypeRadio(MigrationType.COLD)).toBeChecked();
      await expect(detailsTab.vddkWarningAlert).not.toBeVisible();
    });

    await test.step('Save warm migration and verify', async () => {
      await detailsTab.selectMigrationType(MigrationType.WARM);
      await expect(detailsTab.vddkWarningAlert).toBeVisible();
      await detailsTab.saveMigrationTypeButton.click();
      await expect(detailsTab.editMigrationTypeModal).not.toBeVisible();
      await detailsTab.verifyMigrationType(MigrationType.WARM);
    });
  });
});
