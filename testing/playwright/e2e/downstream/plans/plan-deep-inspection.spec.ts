import { expect, type Locator, type Page } from '@playwright/test';

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
  const inspectModal = new InspectVirtualMachinesModal(page);
  const { name: planName, namespace } = testPlan.metadata;
  const firstVmName = testPlan.testData.virtualMachines?.[0]?.sourceName ?? '';

  await planDetailsPage.navigate(planName, namespace);
  await planDetailsPage.verifyPlanTitle(planName);
  await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

  return { firstVmName, inspectModal, namespace, planDetailsPage, planName };
};

const openInspectModal = async (
  planDetailsPage: PlanDetailsPage,
  inspectModal: InspectVirtualMachinesModal,
): Promise<void> => {
  await planDetailsPage.clickInspectVmsButton();
  await inspectModal.waitForModalOpen();
  await inspectModal.waitForVmTableLoaded();
};

const getVmRow = (page: Page, vmName: string): Locator => {
  return page.getByRole('grid', { name: 'Virtual machines' }).getByRole('row', {
    name: vmName,
    exact: false,
  });
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
    const { inspectModal, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open modal and verify Tech Preview label', async () => {
      await openInspectModal(planDetailsPage, inspectModal);
      await expect(inspectModal.techPreviewLabel).toBeVisible();
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
    const { inspectModal, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open actions dropdown and click Inspect VMs', async () => {
      await planDetailsPage.clickInspectVmsFromActions();
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
    const { firstVmName, inspectModal, planDetailsPage } = await setupPlanDetailsPage(
      page,
      testPlan,
    );

    await test.step('open modal, select VM, and submit', async () => {
      await openInspectModal(planDetailsPage, inspectModal);
      await inspectModal.selectVmByName(firstVmName);
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain('Inspect 1 VM');
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
    const { firstVmName, inspectModal, planDetailsPage } = await setupPlanDetailsPage(
      page,
      testPlan,
    );

    await test.step('submit inspection for a VM', async () => {
      await openInspectModal(planDetailsPage, inspectModal);
      await inspectModal.selectVmByName(firstVmName);
      await inspectModal.clickInspect();
    });

    await test.step('verify status transitions to Running', async () => {
      await expect(getVmRow(page, firstVmName).getByText('Running')).toBeVisible({
        timeout: 30_000,
      });
    });

    await test.step('wait for inspection to complete', async () => {
      await expect(
        getVmRow(page, firstVmName).getByText(/Inspection passed|Inspection failed/),
      ).toBeVisible({ timeout: 300_000 });
    });
  });

  test('should allow re-inspection after completion', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { firstVmName, inspectModal, planDetailsPage } = await setupPlanDetailsPage(
      page,
      testPlan,
    );

    await test.step('verify VM has a completed inspection status', async () => {
      const status = await planDetailsPage.virtualMachinesTab.getVmInspectionStatus(firstVmName);
      expect(status).toMatch(/Inspection passed|Inspection failed/);
    });

    await test.step('open inspect modal and verify completed status shown', async () => {
      await openInspectModal(planDetailsPage, inspectModal);
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
      await expect(getVmRow(page, firstVmName).getByText('Running')).toBeVisible({
        timeout: 30_000,
      });
    });
  });

  test('should disable confirm button when no VMs are selected', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { inspectModal, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open inspect modal', async () => {
      await openInspectModal(planDetailsPage, inspectModal);
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
    const { inspectModal, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open modal and select all VMs', async () => {
      await openInspectModal(planDetailsPage, inspectModal);
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
