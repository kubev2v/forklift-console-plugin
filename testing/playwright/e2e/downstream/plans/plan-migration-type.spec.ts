import { expect } from '@playwright/test';

import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
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
});
