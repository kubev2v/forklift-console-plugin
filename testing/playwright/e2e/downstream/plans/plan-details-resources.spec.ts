import { setupPlanDetailsPage } from '../../../fixtures/helpers/planDetailsHelpers';
import { sharedProviderFixtures as test } from '../../../fixtures/resourceFixtures';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Details - Resources Tab', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should render resources tab with VM/CPU/memory inventory aggregates', async ({
    page,
    testPlan,
    testProvider: _testProvider, // ensures provider fixture runs before testPlan
  }) => {
    const { planDetailsPage } = await setupPlanDetailsPage(page, testPlan);

    await test.step('Navigate to the Resources tab', async () => {
      await planDetailsPage.resourcesTab.navigateToResourcesTab();
    });

    await test.step('Verify tab is selected and URL contains /resources', async () => {
      await planDetailsPage.resourcesTab.verifyResourcesTabSelected();
    });

    await test.step('Verify column headers and all resource row labels are present', async () => {
      await planDetailsPage.resourcesTab.verifyTableStructure();
    });

    await test.step('Verify each resource row renders a numeric total and a valid running value', async () => {
      await planDetailsPage.resourcesTab.verifyAggregateCells();
    });
  });
});
