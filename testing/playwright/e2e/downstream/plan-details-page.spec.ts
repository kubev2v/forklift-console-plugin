import { expect } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import type { PlanTestData } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';

test.describe('Plan Details Navigation', { tag: '@downstream' }, () => {
  test('should navigate to plan details and verify page content', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planName = testPlan.metadata!.name!;
    const namespace = testPlan.metadata!.namespace ?? 'openshift-mtv';
    const planDetailsPage = new PlanDetailsPage(page);
    const navigation = new NavigationHelper(page);

    await navigation.navigateToPlanDetails(planName, namespace);

    await planDetailsPage.verifyPlanTitle(planName);
    await planDetailsPage.verifyPlanDetailsURL(planName);
    await planDetailsPage.verifyNavigationTabs();
  });
});

test.describe('Plan Details - VM Rename Validation', { tag: '@downstream' }, () => {
  test('should handle VM rename validation - success and failure scenarios', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');

    const planDetailsPage = new PlanDetailsPage(page);
    const navigationHelper = new NavigationHelper(page);

    const planName = testPlan.metadata!.name!;
    const namespace = testPlan.metadata!.namespace ?? 'openshift-mtv';

    await navigationHelper.navigateToPlanDetails(planName, namespace);
    await planDetailsPage.verifyPlanTitle(planName);

    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    const testData = testPlan.testData as PlanTestData;
    await planDetailsPage.virtualMachinesTab.verifyVirtualMachinesTab(testData);

    const originalVmName = testData.virtualMachines?.[0]?.sourceName;

    const invalidNamesWithErrors = ['VM-With-Capitals', 'invalid@symbol'];

    for (const name of invalidNamesWithErrors) {
      await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.clear();
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.waitFor({ state: 'attached' });
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.fill(name);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.press('Tab');

      await expect(planDetailsPage.virtualMachinesTab.validationErrorMessage).toBeVisible();
      await expect(planDetailsPage.virtualMachinesTab.saveButton).toBeDisabled();

      await planDetailsPage.virtualMachinesTab.cancelButton.click();
      await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).not.toBeVisible();

      await page.waitForTimeout(500);
    }

    const validNames = ['valid-name-123', 'test123'];

    for (const name of validNames) {
      await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.clear();
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.waitFor({ state: 'attached' });
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.fill(name);
      await planDetailsPage.virtualMachinesTab.renameTargetNameInput.press('Tab');
      await expect(planDetailsPage.virtualMachinesTab.validationErrorMessage).not.toBeVisible();
      await expect(planDetailsPage.virtualMachinesTab.saveButton).toBeEnabled();

      await planDetailsPage.virtualMachinesTab.cancelButton.click();
      await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).not.toBeVisible({
        timeout: 10000,
      });

      await page.waitForTimeout(500);
    }

    const finalValidName = 'renamed-vm-test';

    await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
    await planDetailsPage.virtualMachinesTab.renameTargetNameInput.clear();
    await planDetailsPage.virtualMachinesTab.renameTargetNameInput.fill(finalValidName);

    await expect(planDetailsPage.virtualMachinesTab.saveButton).toBeEnabled();
    await planDetailsPage.virtualMachinesTab.saveButton.click();
    await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).not.toBeVisible();

    await planDetailsPage.virtualMachinesTab.openRenameDialog(originalVmName);
    await expect(planDetailsPage.virtualMachinesTab.renameTargetNameInput).toHaveValue(
      finalValidName,
    );

    await planDetailsPage.virtualMachinesTab.cancelButton.click();
  });
});
