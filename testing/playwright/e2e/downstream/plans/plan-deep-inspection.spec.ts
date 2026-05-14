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
  await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
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
    await setupPlanDetailsPage(page, testPlan);

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

    await test.step('expand a VM row', async () => {
      await planDetailsPage.virtualMachinesTab.expandFirstVMDetailsRow();
    });

    await test.step('verify Inspections section is visible', async () => {
      await expect(page.getByTestId('inspections-section')).toBeVisible();
    });
  });

  test('should have inspection status filter option', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('verify inspection status filter exists', async () => {
      await planDetailsPage.virtualMachinesTab.verifyFilterOptionExists('Inspection status');
    });
  });

  test('should transition inspection status from Running to completed', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');
    const { planDetailsPage, testData } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);
    const firstVmName = testData.virtualMachines?.[0]?.sourceName ?? '';

    await test.step('submit inspection for a VM', async () => {
      await planDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
      await inspectModal.selectVmByName(firstVmName);
      await inspectModal.clickInspect();
    });

    await test.step('verify status transitions to Running', async () => {
      const vmGrid = page.getByRole('grid', { name: 'Virtual machines' });
      const vmRow = vmGrid.getByRole('row', { name: new RegExp(firstVmName) });
      await expect(vmRow.getByText('Running')).toBeVisible({ timeout: 30_000 });
    });

    await test.step('wait for inspection to complete', async () => {
      const vmGrid = page.getByRole('grid', { name: 'Virtual machines' });
      const vmRow = vmGrid.getByRole('row', { name: new RegExp(firstVmName) });
      await expect(vmRow.getByText(/Inspection passed|Inspection failed/)).toBeVisible({
        timeout: 300_000,
      });
    });
  });

  test('should allow re-inspection after completion', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');
    const { planDetailsPage, testData } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);
    const firstVmName = testData.virtualMachines?.[0]?.sourceName ?? '';

    await test.step('verify VM has a completed inspection status', async () => {
      const status = await planDetailsPage.virtualMachinesTab.getVmInspectionStatus(firstVmName);
      expect(status).toMatch(/Inspection passed|Inspection failed/);
    });

    await test.step('open inspect modal and verify completed status shown', async () => {
      await planDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
      const modalStatus = await inspectModal.getVmInspectionStatus(firstVmName);
      expect(modalStatus).toMatch(/Inspection passed|Inspection failed/);
    });

    await test.step('select VM and submit re-inspection', async () => {
      await inspectModal.selectVmByName(firstVmName);
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain('Inspect 1 VM');
      await inspectModal.clickInspect();
    });

    await test.step('verify status transitions back to Running', async () => {
      const vmGrid = page.getByRole('grid', { name: 'Virtual machines' });
      const vmRow = vmGrid.getByRole('row', { name: new RegExp(firstVmName) });
      await expect(vmRow.getByText('Running')).toBeVisible({ timeout: 30_000 });
    });
  });

  test('should disable confirm button when no VMs are selected', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);

    await test.step('open inspect modal', async () => {
      await planDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('verify confirm button is disabled with no selection', async () => {
      const isDisabled = await inspectModal.isConfirmDisabled();
      expect(isDisabled).toBe(true);
    });

    await test.step('close modal', async () => {
      await inspectModal.close();
    });
  });

  test('should select all VMs and update confirm button text', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    if (!testPlan) throw new Error('testPlan is required');
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    const inspectModal = new InspectVirtualMachinesModal(page);

    await test.step('open inspect modal', async () => {
      await planDetailsPage.clickInspectVmsButton();
      await inspectModal.waitForModalOpen();
      await inspectModal.waitForVmTableLoaded();
    });

    await test.step('select all VMs', async () => {
      await inspectModal.selectAllVms();
    });

    await test.step('verify confirm button reflects total VM count', async () => {
      const vmCount = await inspectModal.getVmRowCount();
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain(`Inspect ${vmCount} VM`);
    });

    await test.step('close modal', async () => {
      await inspectModal.close();
    });
  });
});
