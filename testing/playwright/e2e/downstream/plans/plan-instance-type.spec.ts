import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const VM_RHEL = 'mtv-func-rhel9';
const VM_WIN = 'mtv-func-win2019';

test.describe('Plan per-VM instance type (MTV-1661)', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should set instance types during plan creation and verify in review', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
      virtualMachines: [
        { folder: 'vm', sourceName: VM_RHEL },
        { folder: 'vm', sourceName: VM_WIN },
      ],
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToAdditionalSettings(testData);

    const { additionalSettings } = wizard;
    await additionalSettings.verifyStepVisible();
    await expect(additionalSettings.instanceTypesSection).toBeVisible({ timeout: 30_000 });
    await additionalSettings.verifyInstanceTypeDropdownCount(2);

    const rhelLabel = await additionalSettings.selectNonNoneInstanceTypeByIndex(VM_RHEL, 0);
    const winLabel = await additionalSettings.selectNonNoneInstanceTypeByIndex(VM_WIN, 1);
    testData.additionalPlanSettings = {
      instanceTypes: {
        [VM_RHEL]: rhelLabel,
        [VM_WIN]: winLabel,
      },
    };

    await wizard.clickSkipToReview();
    await wizard.review.verifyReviewStep(testData);
    await wizard.clickNext();
    await wizard.waitForPlanCreation();

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    await planDetailsPage.virtualMachinesTab.enableColumn('Instance type');

    await planDetailsPage.virtualMachinesTab.waitForVMInstanceType(VM_RHEL, rhelLabel);
    await planDetailsPage.virtualMachinesTab.waitForVMInstanceType(VM_WIN, winLabel);
  });

  test('should edit instance type from plan details VM kebab menu', async ({
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

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    await planDetailsPage.virtualMachinesTab.enableColumn('Instance type');

    const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';

    let picked = '';

    await test.step('Set instance type from modal', async () => {
      const { virtualMachinesTab } = planDetailsPage;
      await virtualMachinesTab.openInstanceTypeDialog(vmName);
      await expect(virtualMachinesTab.editInstanceTypeModal).toBeVisible();
      await expect(virtualMachinesTab.instanceTypeModalSelect).toBeVisible();
      await expect(virtualMachinesTab.instanceTypeModalSaveButton).toBeDisabled();

      await virtualMachinesTab.instanceTypeModalSelect.click();
      const listbox = page.getByRole('listbox');
      await expect(listbox).toBeVisible();
      const secondOption = listbox.getByRole('option').nth(1);
      picked = (await secondOption.innerText()).split('\n')[0]?.trim() ?? '';
      await secondOption.click();
      await virtualMachinesTab.instanceTypeModalSaveButton.click();
      await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
      await virtualMachinesTab.waitForVMInstanceType(vmName, picked);
    });

    await test.step('Cancel discards changes', async () => {
      const { virtualMachinesTab } = planDetailsPage;
      await virtualMachinesTab.openInstanceTypeDialog(vmName);
      await virtualMachinesTab.instanceTypeModalSelect.click();
      await page.getByRole('option', { name: /^None/ }).click();
      await page.getByTestId('modal-cancel-button').click();
      await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
      await virtualMachinesTab.waitForVMInstanceType(vmName, picked);
    });

    await test.step('Clear instance type to None', async () => {
      const { virtualMachinesTab } = planDetailsPage;
      await virtualMachinesTab.openInstanceTypeDialog(vmName);
      await virtualMachinesTab.instanceTypeModalSelect.click();
      await page.getByRole('option', { name: /^None/ }).click();
      await virtualMachinesTab.instanceTypeModalSaveButton.click();
      await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
      await virtualMachinesTab.waitForVMInstanceType(vmName, '-');
    });
  });
});
