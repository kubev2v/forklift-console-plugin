import { expect, test } from '@playwright/test';

import { providerOnlyFixtures as providerTest } from '../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { ProviderDetailsPage } from '../../page-objects/ProviderDetailsPage/ProviderDetailsPage';
import { createPlanTestData, type PlanTestData } from '../../types/test-data';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { V2_11_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

providerTest.describe('VM folder list - Plan Creation', { tag: '@downstream' }, () => {
  requireVersion(providerTest, V2_11_0);

  providerTest(
    'should verify VM selection functionality on plan creation wizard',
    async ({ page, testProvider, resourceManager }) => {
      const testData: PlanTestData = createPlanTestData({
        sourceProvider: testProvider?.metadata?.name ?? '',
      });
      resourceManager.addPlan(testData.planName, testData.planProject);

      await test.step('1. Navigate to wizard and load', async () => {
        const wizard = new CreatePlanWizardPage(page, resourceManager);
        await wizard.navigate();
        await wizard.waitForWizardLoad();

        await wizard.generalInformation.fillAndComplete(testData);
        await wizard.clickNext();
      });

      const wizard = new CreatePlanWizardPage(page, resourceManager);
      const vmStep = wizard.virtualMachines;

      await test.step('2. Verify VM selection step is visible', async () => {
        await vmStep.verifyStepVisible();
        await vmStep.verifyTableLoaded();
      });

      await test.step('3. Test VM selection with search filter', async () => {
        const folderName = 'vm';
        const searchTerm = 'win2019';

        await vmStep.expandFolder(folderName);
        await page.waitForTimeout(500);

        const initialCount = await vmStep.getFolderVMCount(folderName);
        expect(initialCount).toBeGreaterThan(0);

        await vmStep.search(searchTerm);
        await page.waitForTimeout(1500);

        const filteredCount = await vmStep.getFolderVMCount(folderName);
        expect(filteredCount).toBeGreaterThan(0);
        expect(filteredCount).toBeLessThan(initialCount);

        await vmStep.selectFolder(folderName);
        await page.waitForTimeout(800);

        const folderCheckbox = page
          .getByTestId(`folder-${folderName}`)
          .locator('input[type="checkbox"]');
        const isChecked = await folderCheckbox.isChecked();
        expect(isChecked).toBe(true);

        await vmStep.clearAllFilters();
        await page.waitForTimeout(2000);

        const countAfterClear = await vmStep.getFolderVMCount(folderName);
        expect(countAfterClear).toBe(initialCount);

        const folderCheckboxAfterClear = page
          .getByTestId(`folder-${folderName}`)
          .locator('input[type="checkbox"]');

        const isStillChecked = await folderCheckboxAfterClear.isChecked();
        const checkboxElement = await folderCheckboxAfterClear.elementHandle();
        const isIndeterminate =
          checkboxElement &&
          (await checkboxElement.evaluate((el: HTMLInputElement) => el.indeterminate));

        expect(isStillChecked ?? isIndeterminate).toBe(true);
      });
    },
  );
});

providerTest.describe('VM folder list - Provider Details Page', { tag: '@downstream' }, () => {
  requireVersion(providerTest, V2_11_0);

  providerTest(
    'should verify VM table functionality on provider details page',
    async ({ page, testProvider, resourceManager }) => {
      const providerName = testProvider?.metadata?.name ?? '';
      const providerDetailsPage = new ProviderDetailsPage(page);
      const vmTab = providerDetailsPage.virtualMachinesTab;

      await test.step('1. Navigate to provider details page and VM tab', async () => {
        await providerDetailsPage.navigate(providerName, MTV_NAMESPACE);
        await providerDetailsPage.navigateToVirtualMachinesTab();
      });

      await test.step('2. Verify VM table is loaded', async () => {
        await vmTab.verifyTableLoaded();
      });

      await test.step('3. Test VM folder list/tree functionality - expand and collapse folders', async () => {
        await vmTab.testFolderExpandCollapse();
      });

      await test.step('4. Test column management - remove column', async () => {
        const initialColumns = await vmTab.getColumns();
        expect(initialColumns).toContain('Name');

        await vmTab.removeColumn('Host');

        const columnsAfterRemove = await vmTab.getColumns();
        expect(columnsAfterRemove).not.toContain('Host');
      });

      await test.step('5. Test column management - add column', async () => {
        await vmTab.addColumn('Path');

        const columnsAfterAdd = await vmTab.getColumns();
        expect(columnsAfterAdd).toContain('Path');
      });

      await test.step('6. Test column management - reorder columns via drag and drop', async () => {
        const initialColumns = await vmTab.getColumns();
        const initialPowerIndex = initialColumns.indexOf('Power');
        const initialConcernsIndex = initialColumns.indexOf('Concerns');

        expect(initialPowerIndex).toBeGreaterThan(initialConcernsIndex);

        await vmTab.reorderColumn('Power', 'Concerns');

        const finalColumns = await vmTab.getColumns();
        expect(finalColumns).toContain('Name');
        expect(finalColumns).toContain('Path');
        expect(finalColumns).not.toContain('Host');

        const finalPowerIndex = finalColumns.indexOf('Power');
        const finalConcernsIndex = finalColumns.indexOf('Concerns');
        expect(finalPowerIndex).toBeLessThan(finalConcernsIndex);
      });

      await test.step('7. Test filtering - VM count in folder should change with search filter', async () => {
        const folderName = 'vm';

        await vmTab.expandFolder(folderName);

        const initialCount = await vmTab.getFolderVMCount(folderName);
        expect(initialCount).toBeGreaterThan(0);

        await vmTab.search('win2019');
        await page.waitForTimeout(1000);

        const filteredCount = await vmTab.getFolderVMCount(folderName);
        expect(filteredCount).toBeLessThan(initialCount);
        expect(filteredCount).toBeGreaterThan(0);

        await vmTab.clearAllFilters();

        const countAfterClear = await vmTab.getFolderVMCount(folderName);
        expect(countAfterClear).toBe(initialCount);
      });

      await test.step('8. Test sorting by Name column', async () => {
        const firstVMNameBefore = await vmTab.getFirstVMName();

        await vmTab.sortByColumn('Name');

        const firstVMNameAfterSort = await vmTab.getFirstVMName();

        expect(firstVMNameAfterSort).not.toBe(firstVMNameBefore);
        expect(firstVMNameBefore).not.toBe('');
        expect(firstVMNameAfterSort).not.toBe('');
      });

      await test.step('9. Test sorting by Concerns column and expand concern icons', async () => {
        await vmTab.sortByColumn('Concerns');
        await vmTab.testConcernButton();
      });
    },
  );
});
