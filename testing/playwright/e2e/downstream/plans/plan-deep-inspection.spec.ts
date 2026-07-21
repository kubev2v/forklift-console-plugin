import { expect, type Page } from '@playwright/test';

import { createPlan } from '../../../fixtures/helpers/resourceCreationHelpers';
import { sharedProviderFixtures } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { NetworkTargets, type PlanTestData, SourceNetworks } from '../../../types/test-data';
import {
  ACTIVE_OR_COMPLETED_STATUSES,
  ACTIVE_STATUSES,
  COMPLETED_STATUSES,
  inspectionStatusDisplayToFilterId,
  isCompletedInspectionStatus,
} from '../../../utils/inspection-status';
import { requireVddk } from '../../../utils/requireVddk';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

// Deep inspection creates vSphere snapshots — only inspect mtv-func-win2022 here.
// mtv-func-rhel9 is a Select All peer and must never be submitted for inspection
// (avoids VMHasSnapshots conflicts with migration-happy-path / plan-migration-type).
const INSPECTED_VM = 'mtv-func-win2022';
const SELECT_ALL_PEER_VM = 'mtv-func-rhel9';

const test = sharedProviderFixtures.extend<{ testPlan: Awaited<ReturnType<typeof createPlan>> }>({
  testPlan: async ({ page, resourceManager, testProvider }, setValue) => {
    if (!testProvider) throw new Error('testPlan fixture requires testProvider');
    const plan = await createPlan(page, resourceManager, {
      sourceProvider: testProvider,
      customPlanData: {
        virtualMachines: [
          { folder: 'vm', sourceName: INSPECTED_VM },
          { folder: 'vm', sourceName: SELECT_ALL_PEER_VM },
        ],
        // mtv-func-win2022 has 2 NICs; explicit mappings avoid the duplicate-Default-Network validation error.
        networkMap: {
          mappings: [
            { source: SourceNetworks.MGMT_NETWORK, target: NetworkTargets.DEFAULT },
            { source: SourceNetworks.VM_NETWORK, target: NetworkTargets.IGNORE },
          ],
        },
      },
    });
    await setValue(plan);
  },
});

type TestPlan = { metadata: { name: string; namespace: string }; testData: PlanTestData };

type SetupResult = {
  firstVmName: string;
  namespace: string;
  planDetailsPage: PlanDetailsPage;
  planName: string;
  secondVmName: string;
};

const setupPlanDetailsPage = async (
  page: Page,
  testPlan: TestPlan | undefined,
): Promise<SetupResult> => {
  if (!testPlan) throw new Error('testPlan is required');
  const planDetailsPage = new PlanDetailsPage(page);
  const { name: planName, namespace } = testPlan.metadata;
  const firstVmName = testPlan.testData.virtualMachines?.[0]?.sourceName;
  const secondVmName = testPlan.testData.virtualMachines?.[1]?.sourceName;
  if (!firstVmName || !secondVmName) {
    throw new Error('Expected two source VMs in plan test data');
  }

  await planDetailsPage.navigate(planName, namespace);
  await planDetailsPage.verifyPlanTitle(planName);
  await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

  return { firstVmName, namespace, planDetailsPage, planName, secondVmName };
};

test.describe('Plan Deep Inspection', { tag: '@downstream' }, () => {
  test.describe.configure({ mode: 'serial' });
  requireVersion(test, V2_12_0);
  requireVddk(test);

  test('should show Inspect VMs button for vSphere plans', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('verify Inspect VMs button is visible', async () => {
      await planDetailsPage.verifyInspectVmsButtonVisible();
    });
  });

  test('should open inspect modal from header button', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open modal and verify Tech Preview label', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
      await expect(inspectModal.techPreviewLabel).toBeVisible();
      await inspectModal.close();
    });
  });

  test('should select VMs and submit inspection', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { firstVmName, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open modal, select VM, and submit', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
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

  test('should filter VMs by inspection status', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { firstVmName, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('verify inspection status filter exists', async () => {
      await planDetailsPage.virtualMachinesTab.verifyFilterOptionExists('Inspection status');
    });

    await test.step('filter by current status and verify results', async () => {
      const currentStatus =
        await planDetailsPage.virtualMachinesTab.getVmInspectionStatus(firstVmName);
      const filterId = inspectionStatusDisplayToFilterId(currentStatus);
      const initialCount = await planDetailsPage.virtualMachinesTab.getRowCount();

      await planDetailsPage.virtualMachinesTab.applyFilter('Inspection status', filterId);

      const filteredCount = await planDetailsPage.virtualMachinesTab.getRowCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      expect(filteredCount).toBeGreaterThan(0);
      await planDetailsPage.virtualMachinesTab.verifyFilteredRowsHaveInspectionStatus(
        currentStatus,
      );

      await planDetailsPage.virtualMachinesTab.clearFilters();
      const restoredCount = await planDetailsPage.virtualMachinesTab.getRowCount();
      expect(restoredCount).toBe(initialCount);
    });
  });

  test('should transition inspection status from Running to completed', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { firstVmName, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    const vmRow = planDetailsPage.virtualMachinesTab.getVmRow(firstVmName);

    await test.step('submit inspection for a VM', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
      await inspectModal.selectVmByName(firstVmName);
      await inspectModal.clickInspect();
    });

    await test.step('verify status becomes observable after submit', async () => {
      await expect(vmRow.getByText(ACTIVE_OR_COMPLETED_STATUSES)).toBeVisible({
        timeout: 30_000,
      });
    });

    await test.step('wait for inspection to complete', async () => {
      await expect(vmRow.getByText(COMPLETED_STATUSES)).toBeVisible({ timeout: 600_000 });
    });
  });

  test('should allow re-inspection after completion', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { firstVmName, planDetailsPage } = await setupPlanDetailsPage(page, testPlan);
    const vmRow = planDetailsPage.virtualMachinesTab.getVmRow(firstVmName);

    await test.step('ensure VM has a completed inspection status', async () => {
      const status = await planDetailsPage.virtualMachinesTab.getVmInspectionStatus(firstVmName);
      if (!isCompletedInspectionStatus(status)) {
        const inspectModal = await planDetailsPage.openInspectModal();
        await inspectModal.selectVmByName(firstVmName);
        await inspectModal.clickInspect();
        await expect(vmRow.getByText(COMPLETED_STATUSES)).toBeVisible({ timeout: 600_000 });
      }
    });

    await test.step('open inspect modal, verify status, and submit re-inspection', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
      const modalStatus = await inspectModal.getVmInspectionStatus(firstVmName);
      expect(modalStatus).toMatch(COMPLETED_STATUSES);
      await inspectModal.selectVmByName(firstVmName);
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain('Inspect 1 VM');
      await inspectModal.clickInspect();
    });

    await test.step('verify status becomes observable after re-submit', async () => {
      await expect(vmRow.getByText(ACTIVE_OR_COMPLETED_STATUSES)).toBeVisible({
        timeout: 30_000,
      });
    });
  });

  test('should disable confirm button when no VMs are selected', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open inspect modal', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();

      const isDisabled = await inspectModal.isConfirmDisabled();
      expect(isDisabled).toBe(true);
      await inspectModal.close();
    });
  });

  test('should exclude VMs with active inspections from Select All', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { firstVmName, planDetailsPage, secondVmName } = await setupPlanDetailsPage(
      page,
      testPlan,
    );
    const activeVmRow = planDetailsPage.virtualMachinesTab.getVmRow(firstVmName);

    await test.step('ensure first VM has an active inspection', async () => {
      const status = await planDetailsPage.virtualMachinesTab.getVmInspectionStatus(firstVmName);
      if (!ACTIVE_STATUSES.test(status)) {
        const inspectModal = await planDetailsPage.openInspectModal();
        await inspectModal.selectVmByName(firstVmName);
        await inspectModal.clickInspect();
      }
      await expect(activeVmRow.getByText(ACTIVE_STATUSES)).toBeVisible({ timeout: 30_000 });
    });

    await test.step('Select All includes only eligible VMs', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
      await inspectModal.waitForVmTableLoaded();

      expect(await inspectModal.getVmRowCount()).toBe(2);
      expect(await inspectModal.isVmCheckboxDisabled(firstVmName)).toBe(true);
      expect(await inspectModal.isVmCheckboxDisabled(secondVmName)).toBe(false);

      await inspectModal.selectAllVms();

      const eligibleCount = await inspectModal.getEligibleVmCount();
      expect(eligibleCount).toBe(1);
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain(`Inspect ${eligibleCount} VM`);

      expect(await inspectModal.isVmCheckboxChecked(firstVmName)).toBe(false);
      expect(await inspectModal.isVmCheckboxChecked(secondVmName)).toBe(true);

      await inspectModal.close();
    });
  });

  test('should select all VMs and update confirm button text', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open modal and select all eligible VMs', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
      await inspectModal.waitForVmTableLoaded();
      await inspectModal.selectAllVms();

      const eligibleCount = await inspectModal.getEligibleVmCount();
      expect(eligibleCount).toBeGreaterThan(0);
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain(`Inspect ${eligibleCount} VM`);
      await inspectModal.close();
    });
  });
});
