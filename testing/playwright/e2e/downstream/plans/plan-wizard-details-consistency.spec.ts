import { expect } from '@playwright/test';

import { providerOnlyFixtures as test } from '../../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { MigrationType } from '../../../types/enums';
import { createPlanTestData, type PlanTestData } from '../../../types/test-data';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Plan Wizard-Details Consistency', { tag: '@downstream' }, () => {
  requireVersion(test, V2_12_0);

  test('should verify warm migration type in review step matches details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
      migrationType: MigrationType.WARM,
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();

    await test.step('Navigate to Migration Type step and select Warm', async () => {
      await wizard.navigateToMigrationTypeStep(testData);
      await wizard.migrationType.verifyStepVisible();
      await wizard.migrationType.selectMigrationType(MigrationType.WARM);
      await expect(wizard.migrationType.warmMigrationRadio).toBeChecked();
    });

    await test.step('Skip to Review and verify migration type value', async () => {
      await wizard.clickSkipToReview();
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyMigrationTypeValue('Warm migration');
    });

    await test.step('Create plan and verify details page', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyMigrationType(MigrationType.WARM);
    });
  });

  test('should verify default settings in review step match details page', async ({
    page,
    testProvider,
    resourceManager,
  }) => {
    const testData: PlanTestData = createPlanTestData({
      sourceProvider: testProvider?.metadata?.name ?? '',
    });
    resourceManager.addPlan(testData.planName, testData.planProject);

    const wizard = new CreatePlanWizardPage(page, resourceManager);
    await wizard.navigate();
    await wizard.waitForWizardLoad();
    await wizard.navigateToMigrationTypeStep(testData);
    await wizard.clickSkipToReview();

    await test.step('Verify default values in review step (vSphere)', async () => {
      await wizard.review.verifyStepVisible();
      await wizard.review.verifyPreserveStaticIPs(true);
      await wizard.review.verifySharedDisks(true);
    });

    await test.step('Create plan and verify details page matches review', async () => {
      await wizard.clickNext();
      await wizard.waitForPlanCreation();
      const planDetailsPage = new PlanDetailsPage(page);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyPreserveStaticIPs(true);
      await planDetailsPage.detailsTab.verifySharedDisks(true);
    });
  });
});
