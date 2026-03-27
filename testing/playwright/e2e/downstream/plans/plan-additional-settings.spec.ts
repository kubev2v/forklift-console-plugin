import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { V2_11_0, V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

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

    // Step 1: Navigate to Additional Settings
    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToAdditionalSettings(testData);

    // Step 2: Configure power state in Additional Settings
    const { additionalSettings } = wizard;
    await additionalSettings.verifyStepVisible();

    // Review and verify power state options
    await additionalSettings.targetPowerStateSelect.click();
    await expect(additionalSettings.powerStateOptionAuto).toHaveText(
      'Retain source VM power state',
    );
    await expect(additionalSettings.powerStateOptionOn).toHaveText('Powered on');
    await expect(additionalSettings.powerStateOptionOff).toHaveText('Powered off');

    // Select the target power state from test data
    await additionalSettings
      .powerStateOption(testData.additionalPlanSettings?.targetPowerState ?? 'on')
      .click();

    await wizard.clickSkipToReview();

    // Step 3: Review and create plan
    await wizard.review.verifyReviewStep(testData);
    await wizard.clickNext();
    await wizard.waitForPlanCreation();

    // Step 4: Verify and edit power state on Details tab
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.detailsTab.navigateToDetailsTab();
    await expect(planDetailsPage.detailsTab.targetVMPowerState('Powered on')).toBeVisible();

    // Edit power state on Details tab
    await planDetailsPage.detailsTab.clickEditTargetVMPowerState();
    await expect(planDetailsPage.detailsTab.editPowerStateModal).toBeVisible();
    // Verify save is disabled and options are present
    await expect(planDetailsPage.detailsTab.savePowerStateButton).toBeDisabled();
    await planDetailsPage.detailsTab.targetPowerStateSelect.click();
    await expect(planDetailsPage.detailsTab.powerStateOptionAuto).toHaveText(
      'Retain source VM power state',
    );
    await expect(planDetailsPage.detailsTab.powerStateOptionOn).toHaveText('Powered on');
    await expect(planDetailsPage.detailsTab.powerStateOptionOff).toHaveText('Powered off');

    // Select new power state and save
    const detailsNewPowerState = 'off';
    await planDetailsPage.detailsTab.powerStateOption(detailsNewPowerState).click();
    await expect(planDetailsPage.detailsTab.savePowerStateButton).toBeEnabled();
    await planDetailsPage.detailsTab.savePowerStateButton.click();

    // Verify the change is reflected on the details page
    await expect(planDetailsPage.detailsTab.targetVMPowerState('Powered off')).toBeVisible();

    // Step 5: Navigate to VMs tab and verify column management
    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

    // Enable target power state column
    await planDetailsPage.virtualMachinesTab.enableColumn('Target power state');

    // Verify column is visible
    const isPowerStateColumnVisible =
      await planDetailsPage.virtualMachinesTab.isColumnVisible('Target power state');
    expect(isPowerStateColumnVisible).toBe(true);

    // Step 6: Verify VM inherits plan power state
    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
    const powerState = await planDetailsPage.virtualMachinesTab.getVMPowerState(vmName);
    expect(powerState).toBe('Powered off (Inherited from plan)');

    // Step 7: Edit VM power state and verify all options
    await planDetailsPage.virtualMachinesTab.openPowerStateDialog(vmName);

    // Verify save is disabled and all 4 options are present
    const { virtualMachinesTab } = planDetailsPage;
    await expect(virtualMachinesTab.powerStateModalSaveButton).toBeDisabled();

    // Click dropdown to see all options
    await virtualMachinesTab.powerStateModalSelect.click();
    await expect(virtualMachinesTab.powerStateOptionInherit).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionInherit).toContainText('Set to: Powered off');
    await expect(virtualMachinesTab.powerStateOptionAuto).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionOn).toBeVisible();
    await expect(virtualMachinesTab.powerStateOptionOff).toBeVisible();

    // Step 8: Change VM power state and verify
    await virtualMachinesTab.powerStateOptionOn.click();
    await expect(virtualMachinesTab.powerStateModalSaveButton).toBeEnabled();
    await virtualMachinesTab.powerStateModalSaveButton.click();

    // Wait for modal to close and table to refresh
    await expect(virtualMachinesTab.editTargetPowerStateModal).not.toBeVisible();
    // Verify the VM now shows the overridden power state
    await planDetailsPage.virtualMachinesTab.waitForVMPowerState(vmName, 'Powered on');
  });

  test('should edit shared disks on plan details and override per-VM', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
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
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await expect(
      planDetailsPage.detailsTab.sharedDisksDetailItem('Migrate shared disks'),
    ).toBeVisible();

    await planDetailsPage.detailsTab.clickEditSharedDisks();
    await expect(planDetailsPage.detailsTab.editSharedDisksModal).toBeVisible();

    await planDetailsPage.detailsTab.editSharedDisksCheckbox.uncheck();
    await expect(planDetailsPage.detailsTab.editSharedDisksCheckbox).not.toBeChecked();
    await planDetailsPage.detailsTab.saveSharedDisksButton.click();
    await expect(planDetailsPage.detailsTab.editSharedDisksModal).not.toBeVisible();

    await expect(
      planDetailsPage.detailsTab.sharedDisksDetailItem('Do not migrate shared disks'),
    ).toBeVisible();

    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    await planDetailsPage.virtualMachinesTab.enableColumn('Shared disks');

    const isColumnVisible =
      await planDetailsPage.virtualMachinesTab.isColumnVisible('Shared disks');
    expect(isColumnVisible).toBe(true);

    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
    const sharedDisks = await planDetailsPage.virtualMachinesTab.getVMSharedDisks(vmName);
    expect(sharedDisks).toBe('Do not migrate shared disks (Inherited from plan)');

    await planDetailsPage.virtualMachinesTab.openSharedDisksDialog(vmName);

    const { virtualMachinesTab } = planDetailsPage;
    await expect(virtualMachinesTab.sharedDisksModalSaveButton).toBeDisabled();

    await expect(virtualMachinesTab.sharedDisksOptionInherit).toBeVisible();
    await expect(virtualMachinesTab.sharedDisksOptionEnabled).toBeVisible();
    await expect(virtualMachinesTab.sharedDisksOptionDisabled).toBeVisible();

    await virtualMachinesTab.sharedDisksOptionEnabled.click();
    await expect(virtualMachinesTab.sharedDisksModalSaveButton).toBeEnabled();
    await virtualMachinesTab.sharedDisksModalSaveButton.click();

    await expect(virtualMachinesTab.editSharedDisksModal).not.toBeVisible();
    await planDetailsPage.virtualMachinesTab.waitForVMSharedDisks(vmName, 'Migrate shared disks');

    await planDetailsPage.virtualMachinesTab.openSharedDisksDialog(vmName);
    await virtualMachinesTab.sharedDisksOptionInherit.click();
    await expect(virtualMachinesTab.sharedDisksModalSaveButton).toBeEnabled();
    await virtualMachinesTab.sharedDisksModalSaveButton.click();

    await expect(virtualMachinesTab.editSharedDisksModal).not.toBeVisible();
    await planDetailsPage.virtualMachinesTab.waitForVMSharedDisks(
      vmName,
      'Do not migrate shared disks (Inherited from plan)',
    );
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
