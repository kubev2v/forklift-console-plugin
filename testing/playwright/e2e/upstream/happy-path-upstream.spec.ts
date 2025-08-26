import { test } from '@playwright/test';

import { setupCreatePlanIntercepts } from '../../intercepts';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { createPlanTestData, PlanCreationFields } from '../../types/test-data';

test.describe(
  'Plans - Upstream Happy Path Migration',
  {
    tag: '@upstream',
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupCreatePlanIntercepts(page);
    });

    test('should run plan creation wizard', async ({ page }) => {
      const plansPage = new PlansListPage(page);
      const createWizard = new CreatePlanWizardPage(page);
      const planDetailsPage = new PlanDetailsPage(page);

      const testData = createPlanTestData({
        [PlanCreationFields.planName]: 'test-create-plan',
        [PlanCreationFields.planProject]: 'openshift-mtv',
        [PlanCreationFields.sourceProvider]: 'test-source-provider',
        [PlanCreationFields.targetProvider]: 'test-target-provider',
        [PlanCreationFields.targetProject]: { name: 'test-target-project', isPreexisting: true },
        [PlanCreationFields.networkMap]: {
          metadata: { name: 'test-network-map-1' },
          isPreExisting: true,
        },
        [PlanCreationFields.storageMap]: {
          metadata: { name: 'test-storage-map-1' },
          isPreExisting: true,
        },
      });

      await plansPage.navigateFromMainMenu();
      await plansPage.clickCreatePlanButton();
      await createWizard.waitForWizardLoad();
      await createWizard.fillAndSubmit(testData);
      await planDetailsPage.verifyBasicPlanDetailsPage(testData);
    });
  },
);
