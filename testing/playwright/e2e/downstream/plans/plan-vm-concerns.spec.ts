import { expect } from '@playwright/test';

import { sharedProviderCustomPlanFixtures as customPlanTest } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { V2_11_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

customPlanTest.describe('Plan Details - VM Concerns', { tag: '@downstream' }, () => {
  requireVersion(customPlanTest, V2_11_0);

  customPlanTest(
    'should verify VM concerns sorting, badges, filtering, and critical alerts',
    async ({ page, createCustomPlan, resourceManager }) => {
      const testPlan = await createCustomPlan({
        virtualMachines: [{ folder: 'vm' }],
        criticalIssuesAction: 'confirm',
        networkMap: {
          isPreexisting: false,
          mappings: [
            { source: 'Mgmt Network', target: 'Default network' },
            { source: 'VM Network', target: 'Ignore network' },
            { source: 'cnv-test', target: 'Ignore network' },
          ],
        },
      });

      const planDetailsPage = new PlanDetailsPage(page);

      await customPlanTest.step('1. Navigate to plan details VM table', async () => {
        await planDetailsPage.navigate(testPlan.metadata.name, testPlan.metadata.namespace);
        await planDetailsPage.virtualMachinesTab.navigateToVirtualMachinesTab();
        await planDetailsPage.virtualMachinesTab.verifyTableLoaded();
      });

      await customPlanTest.step('2. Sort by concerns column (descending)', async () => {
        await planDetailsPage.virtualMachinesTab.verifyConcernsColumnVisible();
        await planDetailsPage.virtualMachinesTab.sortByConcerns();
        await planDetailsPage.virtualMachinesTab.sortByConcerns(); // Click twice for descending
      });

      await customPlanTest.step('3. Verify concern badges (critical, warning, info)', async () => {
        await planDetailsPage.virtualMachinesTab.verifyConcernBadgeExists('critical', 0);
        await planDetailsPage.virtualMachinesTab.verifyConcernBadgeExists('warning');
        await planDetailsPage.virtualMachinesTab.verifyConcernBadgeExists('information');

        await planDetailsPage.virtualMachinesTab.openConcernPopover('critical');
        await planDetailsPage.virtualMachinesTab.verifyConcernPopoverContent({
          headerContains: 'Critical',
          minItems: 1,
        });
        await planDetailsPage.virtualMachinesTab.closeConcernPopover();
      });

      await customPlanTest.step('4. Test expandable VM row for concerns details', async () => {
        await planDetailsPage.virtualMachinesTab.expandFirstVMDetailsRow();
        await planDetailsPage.virtualMachinesTab.verifyExpandedRowHasConcernDetails();
        await planDetailsPage.virtualMachinesTab.collapseFirstVMDetailsRow();
        await planDetailsPage.virtualMachinesTab.verifyExpandedRowIsCollapsed();
      });

      await customPlanTest.step('5. Test concern filters (severity and type)', async () => {
        await planDetailsPage.virtualMachinesTab.expandFilters();
        await planDetailsPage.virtualMachinesTab.verifyFilterOptionExists('Concerns (type)');
        await planDetailsPage.virtualMachinesTab.verifyFilterOptionExists('Concerns (severity)');
        await planDetailsPage.virtualMachinesTab.verifyFilterValues('Concerns (severity)', [
          'Critical',
          'Warning',
          'Information',
        ]);

        const initialCount = await planDetailsPage.virtualMachinesTab.getRowCount();
        await planDetailsPage.virtualMachinesTab.applyFilter('Concerns (severity)', 'Critical');

        const filteredCount = await planDetailsPage.virtualMachinesTab.getRowCount();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
        expect(filteredCount).toBeGreaterThan(0);
        await planDetailsPage.virtualMachinesTab.verifyFilteredRowsHaveBadge('critical');

        await planDetailsPage.virtualMachinesTab.clearFilters();
        const restoredCount = await planDetailsPage.virtualMachinesTab.getRowCount();
        expect(restoredCount).toBe(initialCount);
      });

      await customPlanTest.step('6. Test critical concerns alert in page header', async () => {
        const planName = testPlan.metadata.name;
        const planNamespace = testPlan.metadata.namespace;

        // Add a duplicate VM to trigger Critical:DuplicateVM condition
        const plan = await resourceManager.fetchPlan(page, planName, planNamespace);
        const vms = plan?.spec?.vms ?? [];
        expect(vms.length).toBeGreaterThan(0);

        const [firstVm] = vms;
        const patchedPlan = await resourceManager.patchResource(page, {
          kind: 'Plan',
          resourceName: planName,
          namespace: planNamespace,
          patch: [
            { op: 'add', path: '/spec/vms/-', value: { id: firstVm.id, name: firstVm.name } },
          ],
          patchType: 'json',
        });
        expect(patchedPlan).not.toBeNull();

        // Navigate to plan details and wait for critical alert (controller needs time to reconcile)
        await planDetailsPage.navigate(planName, planNamespace);
        await planDetailsPage.verifyPlanTitle(planName);

        // Poll for the critical alert - controller reconciliation can take 10-30s
        await expect(planDetailsPage.criticalConcernsAlert).toBeVisible({ timeout: 60000 });
        await expect(planDetailsPage.criticalConcernsAlert).toContainText(
          'critical concerns impacting your migration plan',
        );

        await expect(planDetailsPage.viewAllCriticalConcernsButton).toBeVisible();
        await planDetailsPage.openConcernsDrawer();

        await expect(planDetailsPage.concernsDrawerPanel).toBeVisible();
        const drawerTitle = planDetailsPage.concernsDrawerPanel.getByRole('heading', { level: 2 });
        await expect(drawerTitle).toContainText(/concerns/i);

        await planDetailsPage.closeConcernsDrawer();
      });
    },
  );
});
