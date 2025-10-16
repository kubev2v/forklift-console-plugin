import { test } from '@playwright/test';

import { setupForkliftIntercepts } from '../../intercepts';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { createPlanTestData } from '../../types/test-data';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

test.describe(
  'Plans - Upstream Happy Path Migration',
  {
    tag: '@upstream',
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupForkliftIntercepts(page);
    });

    test('should run plan creation wizard', async ({ page }) => {
      const plansPage = new PlansListPage(page);
      const createWizard = new CreatePlanWizardPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      const testData = createPlanTestData({
        planName: 'test-create-plan',
        planProject: MTV_NAMESPACE,
        sourceProvider: 'test-source-provider',
        targetProvider: 'test-target-provider',
        targetProject: { name: 'test-target-project', isPreexisting: true },
        networkMap: { name: 'test-network-map-1', isPreexisting: true },
        storageMap: { name: 'test-storage-map-1', isPreexisting: true },
        virtualMachines: [{ sourceName: 'test-virtual-machine-1' }],
      });

      await plansPage.navigateFromMainMenu();
      await plansPage.clickCreatePlanButton();
      await createWizard.waitForWizardLoad();
      await createWizard.fillAndSubmit(testData);
      await planDetailsPage.verifyPlanTitle(testData.planName);
      await planDetailsPage.verifyBasicPlanDetailsPage(testData);
    });
  },
);
