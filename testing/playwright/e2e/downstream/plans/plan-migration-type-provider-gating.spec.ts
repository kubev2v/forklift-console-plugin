import { expect } from '@playwright/test';

import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Details - Migration Type Provider Gating', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should only show Cold and Warm options for vSphere provider', async ({
    page,
    createCustomPlan,
    testProvider: _testProvider,
  }) => {
    await createCustomPlan();

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Open edit migration type modal', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await expect(planDetailsPage.detailsTab.editMigrationTypeModal).toBeVisible();
    });

    await test.step('Verify Cold and Warm radios are visible', async () => {
      await expect(planDetailsPage.detailsTab.coldMigrationRadio).toBeVisible();
      await expect(planDetailsPage.detailsTab.warmMigrationRadio).toBeVisible();
    });

    await test.step('Verify Live migration radio is NOT visible for vSphere', async () => {
      await expect(planDetailsPage.detailsTab.liveMigrationRadio).not.toBeVisible();
    });
  });
});
