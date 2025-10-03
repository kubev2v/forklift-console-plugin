import { providerOnlyFixtures as test } from '../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData } from '../../types/test-data';

test.describe('Plan Creation Wizard - Project Creation Feature Tests', () => {
  test(
    'should create plan with new target project and verify namespace creation',
    {
      tag: '@downstream',
    },
    async ({ page, resourceManager, testProvider }) => {
      if (!testProvider) {
        throw new Error('Test provider is required for this test');
      }

      const validNames = ['valid-name-123', 'test123'];
      for (const validName of validNames) {
        const uniqueId = crypto.randomUUID();
        const planName = `project-creation-${validName}-${uniqueId}`;
        const targetProjectName = `${validName}-${uniqueId}`;

        const testPlanData = createPlanTestData({
          planName,
          sourceProvider: testProvider.metadata.name,
          targetProject: { name: targetProjectName, isPreexisting: false },
        });

        const createWizard = new CreatePlanWizardPage(page, resourceManager);
        const planDetailsPage = new PlanDetailsPage(page);

        await createWizard.navigate();

        await createWizard.generalInformation.fillAndComplete(testPlanData);
        await createWizard.clickNext();

        await createWizard.virtualMachines.fillAndComplete(testPlanData.virtualMachines);
        await createWizard.clickNext();

        await createWizard.networkMap.fillAndComplete(testPlanData.networkMap);
        await createWizard.clickNext();

        await createWizard.storageMap.fillAndComplete(testPlanData.storageMap);
        await createWizard.clickNext();

        await createWizard.clickSkipToReview();
        await createWizard.review.verifyReviewStep(testPlanData);
        await createWizard.clickNext();
        await createWizard.waitForPlanCreation();

        await planDetailsPage.verifyPlanTitle(testPlanData.planName);
        await planDetailsPage.detailsTab.navigateToDetailsTab();
        await planDetailsPage.detailsTab.verifyPlanDetails(testPlanData);

        resourceManager.addPlan(testPlanData.planName, 'openshift-mtv');
      }
    },
  );

  test(
    'should validate target project name requirements',
    {
      tag: '@downstream',
    },
    async ({ page, testProvider }) => {
      if (!testProvider) {
        throw new Error('Test provider is required for this test');
      }

      const invalidNames = ['', 'VM-With-Capitals', 'invalid@symbol'];

      const createWizard = new CreatePlanWizardPage(page);
      await createWizard.navigate();

      const planName = `validation-test-${Date.now()}`;
      await createWizard.generalInformation.fillPlanName(planName);
      await createWizard.generalInformation.selectProject('openshift-mtv', 'plan-project-select');
      await createWizard.generalInformation.selectSourceProvider(testProvider.metadata.name);
      await createWizard.generalInformation.selectTargetProvider('host');
      await createWizard.generalInformation.waitForTargetProviderNamespaces();

      for (const invalidName of invalidNames) {
        await createWizard.generalInformation.openCreateProjectModal();
        await createWizard.generalInformation.fillProjectNameInModal(invalidName);
        await createWizard.generalInformation.clickCreateProjectInModal();
        await createWizard.generalInformation.expectProjectCreationError();
        await createWizard.generalInformation.cancelProjectCreation();
      }
    },
  );

  test(
    'should create plan with existing target project and verify selection',
    {
      tag: '@downstream',
    },
    async ({ page, resourceManager, testProvider }) => {
      if (!testProvider) {
        throw new Error('Test provider is required for this test');
      }

      const uniqueId = crypto.randomUUID();
      const planName = `existing-project-test-${uniqueId}`;

      const testPlanData = createPlanTestData({
        planName,
        sourceProvider: testProvider.metadata.name,
        targetProject: { name: 'default', isPreexisting: true },
      });

      const createWizard = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);

      await createWizard.navigate();
      await createWizard.fillAndSubmit(testPlanData);

      await planDetailsPage.verifyPlanTitle(testPlanData.planName);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyPlanDetails(testPlanData);

      resourceManager.addPlan(testPlanData.planName, 'openshift-mtv');
    },
  );
});
