import { sharedProviderCustomPlanFixtures as test } from '../../../fixtures/resourceFixtures';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';

test.describe('Plan Details - Migration Type', { tag: '@downstream' }, () => {
  test('should edit migration type', async ({
    page,
    createCustomPlan,
    testProvider: _testProvider,
  }) => {
    // Create a plan with warm migration type (already navigates to plan details page)
    await createCustomPlan({ migrationType: MigrationType.WARM });

    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.detailsTab.navigateToDetailsTab();

    await test.step('Verify initial migration type is warm', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });

    await test.step('Edit migration type from warm to cold', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await planDetailsPage.detailsTab.setWarmMigration(false);
      await planDetailsPage.detailsTab.saveMigrationType();
    });

    await test.step('Verify migration type is now cold', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.COLD);
    });

    await test.step('Edit migration type from cold back to warm', async () => {
      await planDetailsPage.detailsTab.clickEditMigrationType();
      await planDetailsPage.detailsTab.setWarmMigration(true);
      await planDetailsPage.detailsTab.saveMigrationType();
    });

    await test.step('Verify migration type is now warm again', async () => {
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });
  });
});
