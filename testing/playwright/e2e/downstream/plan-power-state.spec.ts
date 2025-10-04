import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData, type PlanTestData } from '../../types/test-data';

test.describe('Plan power state', { tag: '@downstream' }, () => {
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

    // Step 1: Complete plan wizard (General Info, VMs, Network Map, Storage Map, Migration Type)
    await wizard.generalInformation.fillAndComplete(testData);
    await wizard.clickNext();
    await wizard.virtualMachines.fillAndComplete(testData.virtualMachines);
    await wizard.clickNext();
    await wizard.networkMap.fillAndComplete(testData.networkMap);
    await wizard.clickNext();
    await wizard.storageMap.fillAndComplete(testData.storageMap);
    await wizard.clickNext();
    await wizard.clickNext(); // Skip Migration Type Step

    // Step 2: Other settings
    const { additionalSettings } = wizard;
    await additionalSettings.verifyStepVisible();

    // Review options on power state pick list
    await additionalSettings.targetPowerStateSelect.click();
    await expect(additionalSettings.powerStateOptionAuto).toHaveText(
      'Retain source VM power state',
    );
    await expect(additionalSettings.powerStateOptionOn).toHaveText('Powered on');
    await expect(additionalSettings.powerStateOptionOff).toHaveText('Powered off');

    // Select the one on testplan data
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
    await page.waitForTimeout(1000); // Give time for the table to update

    // Verify the VM now shows the overridden power state
    const vmNewPowerState = await planDetailsPage.virtualMachinesTab.getVMPowerState(vmName);
    console.log('Actual VM power state after change:', vmNewPowerState);
    expect(vmNewPowerState).toBe('Powered on');
  });
});
