import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { V2_11_0, V2_12_0 } from '../../../utils/version/constants';
import { isVersionAtLeast, requireVersion } from '../../../utils/version/version';

test.describe('Plan additional settings', { tag: '@downstream' }, () => {
  requireVersion(test, V2_11_0);

  test('should set power state on plan creation, plan details tab, and VMs tab', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
      additionalPlanSettings: {
        targetPowerState: 'on',
      },
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
    const { detailsTab } = planDetailsPage;
    await detailsTab.navigateToDetailsTab();
    await expect(detailsTab.targetVMPowerState('Powered on')).toBeVisible();
    await detailsTab.clickEditTargetVMPowerState();
    await expect(detailsTab.editPowerStateModal).toBeVisible();
    await expect(detailsTab.savePowerStateButton).toBeDisabled();
    await detailsTab.targetPowerStateSelect.click();
    await expect(detailsTab.powerStateOptionAuto).toHaveText('Retain source VM power state');
    await expect(detailsTab.powerStateOptionOn).toHaveText('Powered on');
    await expect(detailsTab.powerStateOptionOff).toHaveText('Powered off');

    await detailsTab.powerStateOption('off').click();
    await expect(detailsTab.savePowerStateButton).toBeEnabled();
    await detailsTab.savePowerStateButton.click();
    await expect(detailsTab.targetVMPowerState('Powered off')).toBeVisible();

    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

    const { virtualMachinesTab } = planDetailsPage;
    await virtualMachinesTab.enableColumn('Target power state');
    expect(await virtualMachinesTab.isColumnVisible('Target power state')).toBe(true);

    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
    expect(await virtualMachinesTab.getVMPowerState(vmName)).toBe(
      'Powered off (Inherited from plan)',
    );

    await virtualMachinesTab.openPowerStateDialog(vmName);
    await expect(virtualMachinesTab.powerStateModalSaveButton).toBeDisabled();
    await virtualMachinesTab.powerStateModalSelect.click();
    await expect(virtualMachinesTab.powerStateOptionInherit).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionInherit).toContainText('Set to: Powered off');
    await expect(virtualMachinesTab.powerStateOptionAuto).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionOn).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionOff).toBeVisible();

    await virtualMachinesTab.powerStateOptionOn.click();
    await expect(virtualMachinesTab.powerStateModalSaveButton).toBeEnabled();
    await virtualMachinesTab.powerStateModalSaveButton.click();

    await expect(virtualMachinesTab.editTargetPowerStateModal).not.toBeVisible();
    await planDetailsPage.virtualMachinesTab.waitForVMPowerState(vmName, 'Powered on');
  });

  test('should edit shared disks on plan details and override per-VM', async ({
    page,
    testProvider,
    resourceManager,
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
    const { detailsTab: dt, virtualMachinesTab: vmt } = planDetailsPage;
    await dt.navigateToDetailsTab();
    await expect(dt.sharedDisksDetailItem('Migrate shared disks')).toBeVisible();

    await dt.clickEditSharedDisks();
    await expect(dt.editSharedDisksModal).toBeVisible();
    await dt.editSharedDisksCheckbox.uncheck();
    await expect(dt.editSharedDisksCheckbox).not.toBeChecked();
    await dt.saveSharedDisksButton.click();
    await expect(dt.editSharedDisksModal).not.toBeVisible();
    await expect(dt.sharedDisksDetailItem('Do not migrate shared disks')).toBeVisible();

    await vmt.navigateToVirtualMachinesTab();
    await vmt.enableColumn('Shared disks');
    expect(await vmt.isColumnVisible('Shared disks')).toBe(true);

    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
    expect(await vmt.getVMSharedDisks(vmName)).toBe(
      'Do not migrate shared disks (Inherited from plan)',
    );
    await vmt.openSharedDisksDialog(vmName);
    await expect(vmt.sharedDisksModalSaveButton).toBeDisabled();
    await expect(vmt.sharedDisksOptionInherit).toBeVisible();
    await expect(vmt.sharedDisksOptionEnabled).toBeVisible();
    await expect(vmt.sharedDisksOptionDisabled).toBeVisible();

    await vmt.sharedDisksOptionEnabled.click();
    await expect(vmt.sharedDisksModalSaveButton).toBeEnabled();
    await vmt.sharedDisksModalSaveButton.click();
    await expect(vmt.editSharedDisksModal).not.toBeVisible();
    await vmt.waitForVMSharedDisks(vmName, 'Migrate shared disks');

    await vmt.openSharedDisksDialog(vmName);
    await vmt.sharedDisksOptionInherit.click();
    await expect(vmt.sharedDisksModalSaveButton).toBeEnabled();
    await vmt.sharedDisksModalSaveButton.click();
    await expect(vmt.editSharedDisksModal).not.toBeVisible();
    await vmt.waitForVMSharedDisks(vmName, 'Do not migrate shared disks (Inherited from plan)');
  });

  test('should set NBDE/Clevis on plan creation and edit from details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
      additionalPlanSettings: {
        useNbdeClevis: true,
      },
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
    await planDetailsPage.detailsTab.navigateToDetailsTab();
    await expect(planDetailsPage.detailsTab.diskDecryptionDetailItem()).toBeVisible();

    // Step 4: Edit disk decryption from Details tab
    await planDetailsPage.detailsTab.clickEditDiskDecryption();
    await expect(planDetailsPage.detailsTab.editDiskDecryptionModal).toBeVisible();
    await expect(planDetailsPage.detailsTab.useNbdeClevisCheckbox).toBeVisible();

    // Step 5: Test checkbox toggle functionality
    await planDetailsPage.detailsTab.useNbdeClevisCheckbox.check();
    await expect(planDetailsPage.detailsTab.useNbdeClevisCheckbox).toBeChecked();
    await planDetailsPage.detailsTab.useNbdeClevisCheckbox.uncheck();
    await expect(planDetailsPage.detailsTab.useNbdeClevisCheckbox).not.toBeChecked();
    await planDetailsPage.detailsTab.useNbdeClevisCheckbox.check();
    await expect(planDetailsPage.detailsTab.useNbdeClevisCheckbox).toBeChecked();

    // Step 6: Save disk decryption changes
    await expect(planDetailsPage.detailsTab.saveDiskDecryptionButton).toBeEnabled();
    await planDetailsPage.detailsTab.saveDiskDecryptionButton.click();
    await expect(planDetailsPage.detailsTab.editDiskDecryptionModal).not.toBeVisible();
  });
});

test.describe('Plan additional settings - PR #2292', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should edit preserve static IPs and shared disks from details page', async ({
    page,
    testProvider,
    resourceManager,
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

    const { detailsTab } = new PlanDetailsPage(page);
    await detailsTab.navigateToDetailsTab();

    await test.step('Verify preserve static IPs default is enabled (vSphere)', async () => {
      await detailsTab.verifyPreserveStaticIPs(true);
    });

    await test.step('Disable preserve static IPs', async () => {
      await detailsTab.clickEditPreserveStaticIPs();
      await expect(detailsTab.preserveStaticIPsCheckbox).toBeChecked();
      await detailsTab.preserveStaticIPsCheckbox.uncheck();
      await expect(detailsTab.preserveStaticIPsCheckbox).not.toBeChecked();
      await detailsTab.savePreserveStaticIPs();
      await detailsTab.verifyPreserveStaticIPs(false);
    });

    await test.step('Re-enable preserve static IPs', async () => {
      await detailsTab.clickEditPreserveStaticIPs();
      await detailsTab.preserveStaticIPsCheckbox.check();
      await expect(detailsTab.preserveStaticIPsCheckbox).toBeChecked();
      await detailsTab.savePreserveStaticIPs();
      await detailsTab.verifyPreserveStaticIPs(true);
    });

    await test.step('Enable shared disks migration', async () => {
      await detailsTab.clickEditMigrateSharedDisks();
      await detailsTab.migrateSharedDisksCheckbox.check();
      await expect(detailsTab.migrateSharedDisksCheckbox).toBeChecked();
      await expect(detailsTab.sharedDisksInfoAlert).toBeVisible();
      await detailsTab.saveMigrateSharedDisks();
      await detailsTab.verifySharedDisks(true);
    });

    await test.step('Disable shared disks migration', async () => {
      await detailsTab.clickEditMigrateSharedDisks();
      await expect(detailsTab.migrateSharedDisksCheckbox).toBeChecked();
      await detailsTab.migrateSharedDisksCheckbox.uncheck();
      await expect(detailsTab.migrateSharedDisksCheckbox).not.toBeChecked();
      await expect(detailsTab.sharedDisksInfoAlert).not.toBeVisible();
      await detailsTab.saveMigrateSharedDisks();
      await detailsTab.verifySharedDisks(false);
    });
  });

  test('should show validation error when selecting warm migration with provider without VDDK', async ({
    page,
    createCustomProvider,
    resourceManager,
  }) => {
    // Create a provider without VDDK image
    const providerWithoutVddk = await createCustomProvider({
      providerKey: 'vsphere-8.0.1',
      namePrefix: 'vddk-validation-test',
      customProviderData: {
        skipVddk: true,
      },
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
