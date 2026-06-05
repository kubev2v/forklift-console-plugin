import { expect, type Page } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import type { VirtualMachinesTab } from '../../../page-objects/PlanDetailsPage/tabs/VirtualMachinesTab';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import type { ResourceManager } from '../../../utils/resource-manager/ResourceManager';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const VM_RHEL = 'mtv-func-rhel9';
const VM_WIN = 'mtv-func-win2019';

/**
 * Creates a plan via the wizard, waits for it to become editable, and navigates
 * to the VMs tab with the Instance type column enabled.
 *
 * Calling this in each test makes the tests independent — every test owns its
 * full setup so `--last-failed` re-runs the whole scenario from scratch.
 */
const createReadyPlan = async (
  page: Page,
  testProvider: { metadata?: { name?: string } } | undefined,
  resourceManager: ResourceManager,
): Promise<{ planDetailsPage: PlanDetailsPage; vmName: string }> => {
  const testData: PlanTestData = createPlanTestData({
    sourceProvider: testProvider?.metadata?.name ?? '',
  });
  resourceManager.addPlan(testData.planName, testData.planProject);

  const wizard = new CreatePlanWizardPage(page, resourceManager);
  await wizard.navigate();
  await wizard.waitForWizardLoad();
  await wizard.fillAndSubmit(testData);

  const planDetailsPage = new PlanDetailsPage(page);
  await planDetailsPage.waitForPlanEditable();
  await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
  await planDetailsPage.virtualMachinesTab.enableColumn('Instance type');

  const vmName = testData.virtualMachines?.[0]?.sourceName ?? '';
  return { planDetailsPage, vmName };
};

/**
 * Opens the instance-type dialog for a VM, selects the first non-None option,
 * saves, and waits for the table cell to reflect the change.
 *
 * Returns the label of the selected option so callers can assert against it.
 */
const pickAndSaveNonNoneInstanceType = async (
  page: Page,
  virtualMachinesTab: VirtualMachinesTab,
  vmName: string,
): Promise<string> => {
  await virtualMachinesTab.openInstanceTypeDialog(vmName);
  await virtualMachinesTab.instanceTypeModalSelect.click();
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  const secondOption = listbox.getByRole('option').nth(1);
  const picked = (await secondOption.innerText()).split('\n')[0]?.trim() ?? '';
  await secondOption.click();
  await virtualMachinesTab.instanceTypeModalSaveButton.click();
  await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
  await virtualMachinesTab.waitForVMInstanceType(vmName, picked);
  return picked;
};

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
    await planDetailsPage.waitForPlanEditable();
    await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    await planDetailsPage.virtualMachinesTab.enableColumn('Instance type');

    await planDetailsPage.virtualMachinesTab.waitForVMInstanceType(VM_RHEL, rhelLabel);
    await planDetailsPage.virtualMachinesTab.waitForVMInstanceType(VM_WIN, winLabel);
  });

  test('should set instance type from plan details VM kebab menu', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const { planDetailsPage, vmName } =
      await test.step('Create plan and navigate to VMs tab', async () =>
        createReadyPlan(page, testProvider, resourceManager));
    const { virtualMachinesTab } = planDetailsPage;

    // Open the modal once; both steps operate within the same modal session so we
    // also verify that the full open → verify → select → save flow works end-to-end.
    await virtualMachinesTab.openInstanceTypeDialog(vmName);

    await test.step('Verify modal initial state — save disabled before selection', async () => {
      await expect(virtualMachinesTab.editInstanceTypeModal).toBeVisible();
      await expect(virtualMachinesTab.instanceTypeModalSelect).toBeVisible();
      await expect(virtualMachinesTab.instanceTypeModalSaveButton).toBeDisabled();
    });

    await test.step('Select instance type and save', async () => {
      await virtualMachinesTab.instanceTypeModalSelect.click();
      const listbox = page.getByRole('listbox');
      await expect(listbox).toBeVisible();
      const secondOption = listbox.getByRole('option').nth(1);
      const picked = (await secondOption.innerText()).split('\n')[0]?.trim() ?? '';
      await secondOption.click();
      await virtualMachinesTab.instanceTypeModalSaveButton.click();
      await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
      await virtualMachinesTab.waitForVMInstanceType(vmName, picked);
    });
  });

  test('should cancel instance type modal without saving changes', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const { planDetailsPage, vmName } =
      await test.step('Create plan and navigate to VMs tab', async () =>
        createReadyPlan(page, testProvider, resourceManager));
    const { virtualMachinesTab } = planDetailsPage;

    const picked = await pickAndSaveNonNoneInstanceType(page, virtualMachinesTab, vmName);

    await test.step('Cancel preserves the existing instance type', async () => {
      await virtualMachinesTab.openInstanceTypeDialog(vmName);
      await virtualMachinesTab.instanceTypeModalSelect.click();
      await page.getByRole('option', { name: /^None/ }).click();
      await page.getByTestId('modal-cancel-button').click();
      await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
      await virtualMachinesTab.waitForVMInstanceType(vmName, picked);
    });
  });

  test('should clear instance type to None', async ({ page, testProvider, resourceManager }) => {
    const { planDetailsPage, vmName } =
      await test.step('Create plan and navigate to VMs tab', async () =>
        createReadyPlan(page, testProvider, resourceManager));
    const { virtualMachinesTab } = planDetailsPage;

    await pickAndSaveNonNoneInstanceType(page, virtualMachinesTab, vmName);

    await test.step('Select None and save clears instance type', async () => {
      await virtualMachinesTab.openInstanceTypeDialog(vmName);
      await virtualMachinesTab.instanceTypeModalSelect.click();
      await page.getByRole('option', { name: /^None/ }).click();
      await virtualMachinesTab.instanceTypeModalSaveButton.click();
      await expect(virtualMachinesTab.editInstanceTypeModal).not.toBeVisible();
      await virtualMachinesTab.waitForVMInstanceType(vmName, '-');
    });
  });
});
