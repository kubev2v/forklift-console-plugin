import { expect } from '@playwright/test';

import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Details - Migration Type', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should edit migration type', async ({
    page,
    createCustomPlan,
    testProvider: _testProvider,
  }) => {
    await createCustomPlan({ migrationType: MigrationType.WARM });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Verify initial migration type is warm', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });

    await test.step('Open edit modal and verify radio buttons', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.COLD)).toBeVisible();
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.WARM)).toBeVisible();
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.WARM)).toBeChecked();
      await expect(
        planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.COLD),
      ).not.toBeChecked();
    });

    await test.step('Select cold migration and save', async () => {
      await planDetailsPage.detailsTab.selectMigrationType(MigrationType.COLD);
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.COLD)).toBeChecked();
      await planDetailsPage.detailsTab.saveMigrationType();
    });

    await test.step('Verify migration type is now cold', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.COLD);
    });

    await test.step('Edit back to warm migration', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.COLD)).toBeChecked();
      await planDetailsPage.detailsTab.selectMigrationType(MigrationType.WARM);
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.WARM)).toBeChecked();
      await planDetailsPage.detailsTab.saveMigrationType();
    });

    await test.step('Verify migration type is now warm again', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });
  });

  test('should change migration type on duplicated warm plan', async ({
    page,
    createCustomPlan,
    resourceManager,
    testProvider: _testProvider,
  }) => {
    const originalPlan = await createCustomPlan({ migrationType: MigrationType.WARM });
    const duplicatePlanName = `dup-${originalPlan.metadata.name}`;
    resourceManager.addPlan(duplicatePlanName, MTV_NAMESPACE);

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Verify original plan is warm', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });

    await test.step('Duplicate the warm plan', async () => {
      await planDetailsPage.duplicatePlan(duplicatePlanName, MTV_NAMESPACE);
    });

    await test.step('Navigate to details tab on duplicated plan', async () => {
      await planDetailsPage.detailsTab.navigateToDetailsTab();
    });

    await test.step('Verify duplicated plan inherited warm migration type', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });

    await test.step('Change duplicated plan to cold migration', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await expect(planDetailsPage.detailsTab.migrationTypeRadio(MigrationType.WARM)).toBeChecked();
      await planDetailsPage.detailsTab.selectMigrationType(MigrationType.COLD);
      await planDetailsPage.detailsTab.saveMigrationType();
    });

    await test.step('Verify migration type is now cold in the UI', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.COLD);
    });

    await test.step('Verify spec.type and spec.warm are both updated via API', async () => {
      await expect
        .poll(async () => {
          const plan = await resourceManager.fetchPlan(page, duplicatePlanName);
          return { type: plan?.spec?.type, warm: plan?.spec?.warm };
        })
        .toEqual({ type: 'cold', warm: false });
    });
  });
});
