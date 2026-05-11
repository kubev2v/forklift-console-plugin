import { expect, type Page } from '@playwright/test';

import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { InspectVirtualMachinesModal } from '../../../page-objects/InspectVirtualMachinesModal';
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
  return { planDetailsPage, planName, namespace, testData: testPlan.testData };
};

test.describe('Plan Deep Inspection', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should show Inspect VMs button for vSphere plans', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('verify Inspect VMs button is visible', async () => {
      const isVisible = await planDetailsPage.isInspectVmsButtonVisible();
      expect(isVisible).toBe(true);
    });
  });

  test('should open inspect modal from header button', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);

    await test.step('click Inspect VMs button', async () => {
      await planDetailsPage.clickInspectVmsButton();
    });

    await test.step('verify modal opens with Tech Preview label', async () => {
      await inspectModal.waitForModalOpen();
      await expect(inspectModal.techPreviewLabel).toBeVisible();
    });

    await test.step('verify VM table is loaded', async () => {
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('close modal', async () => {
      await inspectModal.close();
    });
  });

  test('should open inspect modal from actions dropdown', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);

    await test.step('open actions dropdown and click Inspect VMs', async () => {
      await planDetailsPage.clickInspectVmsFromActions();
    });

    await test.step('verify modal opens', async () => {
      await inspectModal.waitForModalOpen();
    });

    await test.step('close modal', async () => {
      await inspectModal.close();
    });
  });

  test('should select VMs and submit inspection', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');
    const { planDetailsPage, testData } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);
    const firstVmName = testData.virtualMachines?.[0]?.sourceName ?? '';

    await test.step('open inspect modal', async () => {
      await planDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('select a VM', async () => {
      await inspectModal.selectVmByName(firstVmName);
    });

    await test.step('verify confirm button shows correct count', async () => {
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain('Inspect 1 VM');
    });

    await test.step('submit inspection', async () => {
      await inspectModal.clickInspect();
    });
  });

  test('should show inspection status column in VMs tab', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('navigate to Virtual Machines tab', async () => {
      await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('verify Inspection status column is visible', async () => {
      const columnHeader = page.locator('th', { hasText: 'Inspection status' });
      await expect(columnHeader).toBeVisible();
    });
  });

  test('should show inspection section in expanded VM row', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('navigate to Virtual Machines tab', async () => {
      await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('expand a VM row', async () => {
      const expandButton = page
        .locator('[data-testid="plan-spec-virtual-machines-list"] tbody tr td button')
        .first();
      await expandButton.click();
    });

    await test.step('verify Inspections section is visible', async () => {
      const inspectionsSection = page.getByTestId('inspections-section');
      await expect(inspectionsSection).toBeVisible();
    });
  });

  test('should filter VMs by inspection status', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('navigate to Virtual Machines tab', async () => {
      await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('open inspection status filter and select Not inspected', async () => {
      const filterSelect = page.getByRole('button', { name: /Name/i }).first();
      await filterSelect.click();
      await page.getByRole('option', { name: 'Inspection status' }).click();
      await page.getByRole('button', { name: /Filter by inspection status/i }).click();
      await page.getByRole('option', { name: 'Not inspected' }).click();
    });

    await test.step('verify filtered results', async () => {
      const rows = page.locator('[data-testid="plan-spec-virtual-machines-list"] tbody tr');
      await expect(rows.first()).toBeVisible();
    });
  });
});
