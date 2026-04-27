import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';

test.describe('Plan additional settings', { tag: '@downstream' }, () => {
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

    await test.step('Navigate to Migration Type step in wizard', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await wizard.navigate();
      await wizard.waitForWizardLoad();
      await wizard.navigateToMigrationTypeStep(testData);
      await wizard.migrationType.verifyStepVisible();
    });

    await test.step('Verify cold migration is selected by default with no warning', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await expect(wizard.migrationType.coldMigrationRadio).toBeChecked();
      await expect(wizard.migrationType.vddkWarningAlert).not.toBeVisible();
    });

    await test.step('Select warm migration and verify VDDK warning appears', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await wizard.migrationType.selectMigrationType(MigrationType.WARM);
      await expect(wizard.migrationType.warmMigrationRadio).toBeChecked();
      await expect(wizard.migrationType.vddkWarningAlert).toBeVisible();
    });

    await test.step('Switch back to cold migration and verify warning disappears', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await wizard.migrationType.selectMigrationType(MigrationType.COLD);
      await expect(wizard.migrationType.coldMigrationRadio).toBeChecked();
      await expect(wizard.migrationType.vddkWarningAlert).not.toBeVisible();
    });

    await test.step('Create the plan', async () => {
      const wizard = new CreatePlanWizardPage(page, resourceManager);
      await wizard.clickNext();
      await wizard.clickSkipToReview();
      await wizard.review.verifyReviewStep(testData);
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
    });

    const planDetailsPage = new PlanDetailsPage(page);

    await test.step('Navigate to Details tab on plan details page', async () => {
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.COLD);
    });

    await test.step('Edit migration type to warm and verify VDDK warning appears', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await expect(planDetailsPage.detailsTab.editMigrationTypeModal).toBeVisible();
      await expect(planDetailsPage.detailsTab.warmMigrationSwitch).not.toBeChecked(); // Should be off for cold
      await planDetailsPage.detailsTab.warmMigrationSwitch.check({ force: true }); // Turn on warm migration
      await expect(planDetailsPage.detailsTab.warmMigrationSwitch).toBeChecked();
      await expect(planDetailsPage.detailsTab.vddkWarningAlert).toBeVisible();
    });

    await test.step('Toggle back to cold migration and verify warning disappears', async () => {
      await planDetailsPage.detailsTab.warmMigrationSwitch.uncheck({ force: true }); // Turn off warm migration
      await expect(planDetailsPage.detailsTab.warmMigrationSwitch).not.toBeChecked();
      await expect(planDetailsPage.detailsTab.vddkWarningAlert).not.toBeVisible();
    });

    await test.step('Toggle to warm migration again and verify warning reappears', async () => {
      await planDetailsPage.detailsTab.warmMigrationSwitch.check({ force: true }); // Turn on warm migration
      await expect(planDetailsPage.detailsTab.warmMigrationSwitch).toBeChecked();
      await expect(planDetailsPage.detailsTab.vddkWarningAlert).toBeVisible();
    });

    await test.step('Save the migration type change', async () => {
      await planDetailsPage.detailsTab.saveMigrationTypeButton.click();
      await expect(planDetailsPage.detailsTab.editMigrationTypeModal).not.toBeVisible();
    });

    await test.step('Verify migration type is now warm', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });
  });
});
