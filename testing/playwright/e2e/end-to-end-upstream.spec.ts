import { test } from '@playwright/test';

import { setupCreatePlanIntercepts } from '../intercepts';
import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';
import { createPlanTestData } from '../types/test-data';

test.describe(
  'Plans - Upstream End-to-End Migration',
  {
    tag: '@upstream',
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupCreatePlanIntercepts(page);
    });

    test('should run plan creation wizard', async ({ page }) => {
      const testData = createPlanTestData({
        planName: 'test-create-plan',
        planProject: 'openshift-mtv',
        sourceProvider: 'test-source-provider',
        targetProvider: 'test-target-provider',
        targetProject: 'test-target-project',
        networkMap: { name: 'test-network-map-1', isPreExisting: true },
        storageMap: { name: 'test-storage-map-1', isPreExisting: true },
      });

      const plansPage = new PlansListPage(page);
      await plansPage.navigateFromMainMenu();
      const createWizard = new CreatePlanWizardPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      await plansPage.clickCreatePlanButton();
      await createWizard.waitForWizardLoad();
      await createWizard.fillAndSubmit(testData);
      await planDetailsPage.verifyBasicPlanDetailsPage(testData);
    });
  },
);
