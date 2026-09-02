import { expect } from '@playwright/test';

import { clonePlan } from '../../../fixtures/helpers/clonePlan';
import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlansListPage } from '../../../page-objects/PlansListPage';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V5_0_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

const BULK_ACTIONS_TEST_TIMEOUT_MS = 600_000;
const EMPTY_SELECTION_HINT = 'Select at least one migration plan.';
const NON_ARCHIVED_DELETE_ALERT = 'Some selected plans are not archived';

test.describe('Plans list - bulk actions', { tag: '@downstream' }, () => {
  requireVersion(test, V5_0_0);

  test('should disable bulk archive and delete when no plans are selected', async ({ page }) => {
    const plansListPage = new PlansListPage(page);

    await test.step('Open the plans list with an empty selection', async () => {
      await plansListPage.navigateDirectly();
      await plansListPage.selectNone();
    });

    await test.step('Archive and Delete stay disabled until a plan is selected', async () => {
      await plansListPage.openBulkActions();
      await expect(plansListPage.archiveMenuItem).toContainText(EMPTY_SELECTION_HINT);
      await expect(plansListPage.deleteMenuItem).toContainText(EMPTY_SELECTION_HINT);
    });
  });

  test('should bulk archive then bulk delete selected plans', async ({
    createCustomPlan,
    page,
    resourceManager,
  }) => {
    test.setTimeout(BULK_ACTIONS_TEST_TIMEOUT_MS);

    const prefix = `e2e-bulk-${crypto.randomUUID().slice(0, 8)}`;
    const planAName = `${prefix}-a`;
    const planBName = `${prefix}-b`;
    const plansListPage = new PlansListPage(page);

    await test.step('Create two disposable plans that share a name prefix', async () => {
      await createCustomPlan({ planName: planAName });
      await clonePlan(resourceManager, planAName, planBName, MTV_NAMESPACE);
      await expect
        .poll(
          async () => (await resourceManager.fetchPlan(planBName, MTV_NAMESPACE))?.metadata?.name,
        )
        .toBe(planBName);
    });

    await test.step('Filter to those plans and select both rows', async () => {
      await plansListPage.navigateDirectly();
      await plansListPage.selectNone();
      await plansListPage.searchForPlan(prefix);
      await plansListPage.expectPlanVisible(planAName);
      await plansListPage.expectPlanVisible(planBName);
      await plansListPage.selectPlanByName(planAName);
      await plansListPage.selectPlanByName(planBName);
    });

    await test.step('Cancel bulk delete leaves the plans unchanged', async () => {
      const modal = await plansListPage.openBulkDeleteModal();
      await expect(modal.getByText(NON_ARCHIVED_DELETE_ALERT)).toBeVisible();
      await expect(modal.getByText(planAName, { exact: true })).toBeVisible();
      await expect(modal.getByText(planBName, { exact: true })).toBeVisible();
      await plansListPage.cancelBulkModal();
      await expect(modal).toBeHidden();
      await plansListPage.expectPlanVisible(planAName);
      await plansListPage.expectPlanVisible(planBName);
    });

    await test.step('Bulk archive both plans and drop them from the default list', async () => {
      const modal = await plansListPage.openBulkArchiveModal();
      await expect(modal.getByText(planAName, { exact: true })).toBeVisible();
      await expect(modal.getByText(planBName, { exact: true })).toBeVisible();
      await plansListPage.confirmBulkModal();
      await expect(modal).toBeHidden();
      await plansListPage.expectPlanHidden(planAName);
      await plansListPage.expectPlanHidden(planBName);
    });

    await test.step('Show archived, re-select, and bulk delete the archived plans', async () => {
      // Re-navigate so selection state does not keep hidden UIDs (MTV-6641).
      await plansListPage.navigateDirectly();
      await plansListPage.setShowArchived(true);
      await plansListPage.searchForPlan(prefix);
      await plansListPage.expectPlanVisible(planAName);
      await plansListPage.expectPlanVisible(planBName);
      await plansListPage.selectNone();
      await plansListPage.selectPlanByName(planAName);
      await plansListPage.selectPlanByName(planBName);

      const modal = await plansListPage.openBulkDeleteModal();
      await expect(modal.getByText(NON_ARCHIVED_DELETE_ALERT)).toHaveCount(0);
      await plansListPage.confirmBulkModal();
      await expect(modal).toBeHidden();
      await plansListPage.expectPlanHidden(planAName);
      await plansListPage.expectPlanHidden(planBName);
    });
  });
});
