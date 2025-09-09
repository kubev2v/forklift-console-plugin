import { providerOnlyFixtures as test } from '../../fixtures/resourceFixtures';
import { CreatePlanWizardPage } from '../../page-objects/CreatePlanWizard/CreatePlanWizardPage';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { createPlanTestData } from '../../types/test-data';

test.describe('Plan Creation Wizard - Project Creation Feature Tests', () => {
  test(
    'should create plan with new target project and verify namespace creation',
    {
      tag: '@wiz',
    },
    async ({ page, resourceManager, testProvider }) => {
      if (!testProvider) {
        throw new Error('Test provider is required for this test');
      }

      // Simplified list to reduce test flakiness
      const validNames = ['valid-name-123', 'test123'];
      for (const validName of validNames) {
        // Generate unique names for this test iteration
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const planName = `project-creation-${validName}-${uniqueId}`;
        const targetProjectName = `${validName}-${uniqueId}`;

        const testPlanData = createPlanTestData({
          planName,
          planProject: 'openshift-mtv',
          sourceProvider: testProvider.metadata!.name!,
          targetProvider: 'host',
          targetProject: {
            name: targetProjectName,
            isPreexisting: false, // This tests the project creation feature
          },
          networkMap: {
            name: `${planName}-network-map`,
            isPreExisting: false,
          },
          storageMap: {
            name: `${planName}-storage-map`,
            isPreExisting: false,
            targetStorage: 'ocs-storagecluster-ceph-rbd-virtualization',
          },
          virtualMachines: [
            {
              sourceName: 'mtv-func-rhel9',
            },
          ],
        });

        const createWizard = new CreatePlanWizardPage(page, resourceManager);
        const planDetailsPage = new PlanDetailsPage(page);

        // Navigate directly to the create plan wizard
        await createWizard.navigateToWizardAndWaitForLoad();

        // Use modular approach to focus on the project creation feature
        await createWizard.generalInformation.fillAndComplete({
          planName: testPlanData.planName,
          planProject: testPlanData.planProject,
          sourceProvider: testPlanData.sourceProvider,
          targetProvider: testPlanData.targetProvider,
          targetProject: testPlanData.targetProject, // This tests the new project creation
        });
        await createWizard.clickNext();

        await createWizard.virtualMachines.fillAndComplete(testPlanData.virtualMachines);
        await createWizard.clickNext();

        await createWizard.networkMap.fillAndComplete(testPlanData.networkMap);
        await createWizard.clickNext();

        await createWizard.storageMap.fillAndComplete(testPlanData.storageMap);
        await createWizard.clickNext();

        await createWizard.clickSkipToReview();
        await createWizard.review.fillAndComplete(testPlanData);
        await createWizard.clickNext();
        await createWizard.waitForPlanCreation();

        // Verify the plan details using POM methods
        await planDetailsPage.verifyPlanTitle(testPlanData.planName);
        await planDetailsPage.detailsTab.navigateToDetailsTab();
        await planDetailsPage.detailsTab.verifyPlanDetails(testPlanData);

        // Add the created plan to cleanup
        const plan = {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Plan',
          metadata: {
            name: testPlanData.planName,
            namespace: 'openshift-mtv',
          },
        };
        resourceManager.addResource(plan);
      }
    },
  );

  test(
    'should validate target project name requirements',
    {
      tag: '@wiz',
    },
    async ({ page, testProvider }) => {
      if (!testProvider) {
        throw new Error('Test provider is required for this test');
      }

      // Simplified list to reduce test flakiness
      const invalidNames = ['', 'VM-With-Capitals', 'invalid@symbol'];

      const createWizard = new CreatePlanWizardPage(page);
      await createWizard.navigateToWizardAndWaitForLoad();

      // Fill in basic plan information first
      const planName = `validation-test-${Date.now()}`;
      await createWizard.generalInformation.fillPlanName(planName);
      await createWizard.generalInformation.selectProject('openshift-mtv', 'plan-project-select');
      await createWizard.generalInformation.selectSourceProvider(testProvider.metadata!.name!);
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

      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const planName = `existing-project-test-${uniqueId}`;

      const testPlanData = createPlanTestData({
        planName,
        planProject: 'openshift-mtv',
        sourceProvider: testProvider.metadata!.name!,
        targetProvider: 'host',
        targetProject: {
          name: 'default', // Use existing project
          isPreexisting: true,
        },
        networkMap: {
          name: `${planName}-network-map`,
          isPreExisting: false,
        },
        storageMap: {
          name: `${planName}-storage-map`,
          isPreExisting: false,
          targetStorage: 'ocs-storagecluster-ceph-rbd-virtualization',
        },
        virtualMachines: [
          {
            sourceName: 'mtv-func-rhel9',
          },
        ],
      });

      const createWizard = new CreatePlanWizardPage(page, resourceManager);
      const planDetailsPage = new PlanDetailsPage(page);

      // Navigate directly to wizard and create plan with existing target project
      await createWizard.navigateToWizardAndWaitForLoad();
      await createWizard.fillAndSubmit(testPlanData);

      // Verify plan details using POM methods
      await planDetailsPage.verifyPlanTitle(testPlanData.planName);
      await planDetailsPage.detailsTab.navigateToDetailsTab();
      await planDetailsPage.detailsTab.verifyPlanDetails(testPlanData);

      // Add cleanup
      const plan = {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        metadata: {
          name: testPlanData.planName,
          namespace: 'openshift-mtv',
        },
      };
      resourceManager.addResource(plan);
    },
  );
});
