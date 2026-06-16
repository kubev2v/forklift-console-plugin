import { expect, type Page } from '@playwright/test';

import { createPlan } from '../../../fixtures/helpers/resourceCreationHelpers';
import { sharedProviderFixtures } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import type { PlanTestData } from '../../../types/test-data';
import { NetworkTargets, SourceNetworks } from '../../../types/test-data';
import {
  ACTIVE_OR_COMPLETED_STATUSES,
  COMPLETED_STATUSES,
  inspectionStatusDisplayToFilterId,
  isCompletedInspectionStatus,
} from '../../../utils/inspection-status';
import { requireVddk } from '../../../utils/requireVddk';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

// Deep inspection creates vSphere snapshots during the inspection process. Leftover snapshots
// trigger VMHasSnapshots (Critical) on any subsequent plan, keeping it in CannotStart.
//
// VM ownership map — keep these isolated; each VM must appear in at most one snapshot-creating suite:
//   mtv-func-rhel9       → migration-happy-path (cold migration)
//   mtv-func-win2019     → migration-happy-path (cold migration)
//   mtv-func-rhel9-uefi  → plan-migration-type  (warm migration)
//   mtv-func-win2022     → plan-deep-inspection  (this file — inspection snapshots)
//
// mtv-func-win2022 has no other test consumers and is confirmed snapshot-free in the inventory.
const test = sharedProviderFixtures.extend<{ testPlan: Awaited<ReturnType<typeof createPlan>> }>({
  testPlan: async ({ page, resourceManager, testProvider }, setValue) => {
    if (!testProvider) throw new Error('testPlan fixture requires testProvider');
    const plan = await createPlan(page, resourceManager, {
      sourceProvider: testProvider,
      customPlanData: {
        virtualMachines: [{ folder: 'vm', sourceName: 'mtv-func-win2022' }],
        // mtv-func-win2022 has two NICs (Mgmt Network + VM Network). Without explicit
        // mappings the wizard auto-maps both to "Default Network", triggers the
        // "more than one interface mapped to Default Network" validation error, and
        // disables the remove buttons on auto-generated rows (cannot be dismissed).
        // Providing explicit mappings avoids the duplicate-mapping alert entirely.
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
};

const setupPlanDetailsPage = async (
  page: Page,
  testPlan: TestPlan | undefined,
): Promise<SetupResult> => {
  if (!testPlan) throw new Error('testPlan is required');
  const planDetailsPage = new PlanDetailsPage(page);
  const { name: planName, namespace } = testPlan.metadata;
  const firstVmName = testPlan.testData.virtualMachines?.[0]?.sourceName;
  if (!firstVmName) throw new Error('No source VM found in plan test data');

  await planDetailsPage.navigate(planName, namespace);
  await planDetailsPage.verifyPlanTitle(planName);
  await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();

  return { firstVmName, namespace, planDetailsPage, planName };
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

  test('should select all VMs and update confirm button text', async ({
    page,
    testPlan,
    testProvider: _testProvider,
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('open modal and select all VMs', async () => {
      const inspectModal = await planDetailsPage.openInspectModal();
      await inspectModal.selectAllVms();

      const vmCount = await inspectModal.getVmRowCount();
      const buttonText = await inspectModal.getConfirmButtonText();
      expect(buttonText).toContain(`Inspect ${vmCount} VM`);
      await inspectModal.close();
    });
  });
});
