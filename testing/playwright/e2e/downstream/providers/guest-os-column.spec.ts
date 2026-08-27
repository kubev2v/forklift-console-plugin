import { expect, test } from '@playwright/test';

import {
  providerOnlyFixtures as providerTest,
  sharedProviderCustomPlanFixtures as customPlanTest,
} from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { ProviderDetailsPage } from '../../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { createPlanTestData } from '../../../types/test-data';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const GUEST_OS_COLUMN = 'Guest OS';
const FOLDER_NAME = 'vm';

/**
 * MTV-5505 — QE: Guest OS Column and Compatibility Indicators in VM Tables
 *
 * Verifies the Guest OS column feature (DEV: MTV-5503, PR #2457) across the three
 * surfaces where VMs are displayed: Provider VM tab, Plan details VM list, and
 * Plan wizard VM selection step.
 *
 * Gated at MTV 5.0.0+: Guest OS ships on main / 5.0 and is not on release-2.12.
 */
providerTest.describe('Guest OS Column - Provider VM Tab', { tag: '@downstream' }, () => {
  requireVersion(providerTest, V5_0_0);

  providerTest(
    'should display Guest OS column with values, filtering, and sorting',
    async ({ page, testProvider }) => {
      const providerName = testProvider?.metadata?.name ?? '';
      const providerDetailsPage = new ProviderDetailsPage(page);
      const vmTab = providerDetailsPage.virtualMachinesTab;

      await test.step('1. Navigate to provider VM tab', async () => {
        await providerDetailsPage.navigate(providerName, MTV_NAMESPACE);
        await providerDetailsPage.navigateToVirtualMachinesTab();
        await vmTab.verifyTableLoaded();
      });

      await test.step('2. Verify Guest OS column is visible by default', async () => {
        const columns = await vmTab.getColumns();
        expect(columns).toContain(GUEST_OS_COLUMN);
      });

      await test.step('3. Verify Guest OS cells are rendered for VMs', async () => {
        await vmTab.expandFolder(FOLDER_NAME);

        const guestOSCells = page
          .getByTestId('vsphere-tree-table')
          .locator(`tbody tr[data-testid^="vm-"] td[data-label="${GUEST_OS_COLUMN}"]`);

        await expect(guestOSCells.first()).toBeVisible({ timeout: 30_000 });

        const cellTexts = await guestOSCells.allTextContents();
        const nonEmpty = cellTexts.filter((text) => text.trim() !== '-' && text.trim() !== '');
        expect(nonEmpty.length).toBeGreaterThan(0);
      });

      await test.step('4. Filter attribute dropdown includes Guest OS option', async () => {
        await vmTab.switchFilterAttribute(GUEST_OS_COLUMN);
        // Switching to Guest OS proves the option existed; search input should now
        // show the Guest OS placeholder
        const searchInput = page.getByPlaceholder(/guest os/iu);
        await expect(searchInput).toBeVisible({ timeout: 5_000 });
        // Reset to VM name filter for step 5
        await vmTab.switchFilterAttribute('VM name');
      });

      await test.step('5. Filter by Guest OS reduces VM count in folder', async () => {
        const initialCount = await vmTab.getFolderVMCount(FOLDER_NAME);
        expect(initialCount).toBeGreaterThan(0);

        await vmTab.switchFilterAttribute(GUEST_OS_COLUMN);
        await vmTab.search('Windows');
        await page.waitForTimeout(800);

        const filteredCount = await vmTab.getFolderVMCount(FOLDER_NAME);
        expect(filteredCount).toBeGreaterThan(0);
        expect(filteredCount).toBeLessThan(initialCount);

        await vmTab.clearAllFilters();

        const restoredCount = await vmTab.getFolderVMCount(FOLDER_NAME);
        expect(restoredCount).toBe(initialCount);
      });

      await test.step('6. Sort by Guest OS column works', async () => {
        await vmTab.expandFolder(FOLDER_NAME);

        await vmTab.sortByColumn(GUEST_OS_COLUMN);
        await page.waitForTimeout(500);

        const columns = await vmTab.getColumns();
        expect(columns).toContain(GUEST_OS_COLUMN);

        // Re-sort ascending to normalise state for any subsequent checks
        await vmTab.sortByColumn(GUEST_OS_COLUMN);
        await page.waitForTimeout(300);
      });
    },
  );
});

customPlanTest.describe('Guest OS Column - Plan Details VM List', { tag: '@downstream' }, () => {
  requireVersion(customPlanTest, V5_0_0);

  customPlanTest(
    'should display Guest OS column and filter in plan spec VM list',
    async ({ createCustomPlan, page }) => {
      const testPlan = await createCustomPlan({
        criticalIssuesAction: 'confirm',
        networkMap: {
          isPreexisting: false,
          mappings: [
            { source: 'Mgmt Network', target: 'Default network' },
            { source: 'VM Network', target: 'Ignore network' },
          ],
        },
        virtualMachines: [{ folder: FOLDER_NAME }],
      });

      const planDetailsPage = new PlanDetailsPage(page);
      const vmTab = planDetailsPage.virtualMachinesTab;

      await test.step('1. Navigate to plan details VM tab', async () => {
        await planDetailsPage.navigate(testPlan.metadata.name, testPlan.metadata.namespace);
        await vmTab.navigateToVirtualMachinesTab();
        await vmTab.verifyTableLoaded();
      });

      await test.step('2. Verify Guest OS column header is visible', async () => {
        const isVisible = await vmTab.isColumnVisible(GUEST_OS_COLUMN);
        expect(isVisible).toBe(true);
      });

      await test.step('3. Verify Guest OS filter attribute is available', async () => {
        await vmTab.expandFilters();
        await vmTab.verifyFilterOptionExists(GUEST_OS_COLUMN);
      });

      await test.step('4. Sort by Guest OS column', async () => {
        await vmTab.sortByColumn(GUEST_OS_COLUMN);
        await page.waitForTimeout(300);

        const isVisible = await vmTab.isColumnVisible(GUEST_OS_COLUMN);
        expect(isVisible).toBe(true);
      });
    },
  );
});

providerTest.describe('Guest OS Column - Plan Wizard VM Step', { tag: '@downstream' }, () => {
  requireVersion(providerTest, V5_0_0);

  providerTest(
    'should display Guest OS column in plan wizard VM selection step',
    async ({ page, resourceManager, testProvider }) => {
      const testData = createPlanTestData({
        sourceProvider: testProvider?.metadata?.name ?? '',
      });
      resourceManager.addPlan(testData.planName, testData.planProject);

      const wizard = new CreatePlanWizardPage(page, resourceManager);

      await test.step('1. Navigate wizard to VM selection step', async () => {
        await wizard.navigate();
        await wizard.waitForWizardLoad();
        await wizard.generalInformation.fillAndComplete(testData);
        await wizard.clickNext();
      });

      await test.step('2. Verify VM selection step is loaded', async () => {
        await wizard.virtualMachines.verifyStepVisible();
        await wizard.virtualMachines.verifyTableLoaded();
      });

      await test.step('3. Verify Guest OS column is present in wizard VM table', async () => {
        const columns = await wizard.virtualMachines.getColumns();
        expect(columns).toContain(GUEST_OS_COLUMN);
      });
    },
  );
});
