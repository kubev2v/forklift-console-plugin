import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import type { PlanTestData } from '../../../types/test-data';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

type TestPlan = { metadata: { name: string; namespace: string }; testData: PlanTestData };

const setupPlanDetailsPage = async (page: Page, testPlan: TestPlan | undefined) => {
  if (!testPlan) throw new Error('testPlan is required');
  const planDetailsPage = new PlanDetailsPage(page);
  const { name: planName, namespace } = testPlan.metadata;
  await planDetailsPage.navigate(planName, namespace);
  await planDetailsPage.verifyPlanTitle(planName);
  return { planDetailsPage, planName, namespace };
};

test.describe('Plan Details - Resources Tab', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should navigate to the resources tab and verify the table structure', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('Navigate to the Resources tab', async () => {
      await planDetailsPage.resourcesTab.navigateToResourcesTab();
    });

    await test.step('Verify the Resources tab is selected and URL is correct', async () => {
      await planDetailsPage.resourcesTab.verifyResourcesTabSelected();
    });

    await test.step('Verify the Resources section heading is visible', async () => {
      await expect(planDetailsPage.resourcesTab.heading).toBeVisible();
    });

    await test.step('Verify all three column headers are present', async () => {
      await planDetailsPage.resourcesTab.verifyTableHeaders();
    });

    await test.step('Verify all three resource rows are present', async () => {
      await planDetailsPage.resourcesTab.verifyResourceRows();
    });
  });

  test('should display VM/CPU/memory inventory aggregates in the resources table', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('Navigate to the Resources tab', async () => {
      await planDetailsPage.resourcesTab.navigateToResourcesTab();
    });

    await test.step('Verify Virtual machines row shows a value in both columns', async () => {
      const totalCell = planDetailsPage.resourcesTab.rowVirtualMachines
        .getByRole('gridcell')
        .nth(1);
      const runningCell = planDetailsPage.resourcesTab.rowVirtualMachines
        .getByRole('gridcell')
        .nth(2);
      await expect(totalCell).not.toBeEmpty();
      await expect(runningCell).not.toBeEmpty();
    });

    await test.step('Verify Total CPU count row shows a value in both columns', async () => {
      const totalCell = planDetailsPage.resourcesTab.rowTotalCpuCount.getByRole('gridcell').nth(1);
      const runningCell = planDetailsPage.resourcesTab.rowTotalCpuCount
        .getByRole('gridcell')
        .nth(2);
      await expect(totalCell).not.toBeEmpty();
      await expect(runningCell).not.toBeEmpty();
    });

    await test.step('Verify Total memory row shows a value in both columns', async () => {
      const totalCell = planDetailsPage.resourcesTab.rowTotalMemory.getByRole('gridcell').nth(1);
      const runningCell = planDetailsPage.resourcesTab.rowTotalMemory.getByRole('gridcell').nth(2);
      await expect(totalCell).not.toBeEmpty();
      await expect(runningCell).not.toBeEmpty();
    });
  });
});
