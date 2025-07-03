import { setupAllProvidersIntercepts } from '../intercepts/allProviders';
import { setupCreateNetworkMapIntercepts } from '../intercepts/createNetworkMap';
import { setupCreatePlanIntercepts } from '../intercepts/createPlan';
import { setupCreateStorageMapIntercepts } from '../intercepts/createStorageMap';
import { setupDatastoresIntercepts } from '../intercepts/datastores';
import { setupFoldersIntercepts } from '../intercepts/folders';
import { setupHostsIntercepts } from '../intercepts/hosts';
import { setupNetworkMapsIntercepts } from '../intercepts/networkMaps';
import { setupNetworksIntercepts } from '../intercepts/networks';
import { setupPatchNetworkMapOwnerIntercepts } from '../intercepts/patchNetworkMapOwner';
import { setupPatchStorageMapOwnerIntercepts } from '../intercepts/patchStorageMapOwner';
import { setupPlanDetailsIntercepts } from '../intercepts/planDetails';
import { setupPlansIntercepts } from '../intercepts/plans';
import { setupProjectsIntercepts } from '../intercepts/projects';
import { setupProvidersIntercepts } from '../intercepts/providers';
import { setupStorageClassesIntercepts } from '../intercepts/storageClasses';
import { setupStorageMapsIntercepts } from '../intercepts/storageMaps';
import { setupTargetProviderNamespacesIntercepts } from '../intercepts/targetProviderNamespaces';
import { setupVirtualMachinesIntercepts } from '../intercepts/virtualMachines';
import { CreatePlanWizard } from '../page-objects/CreatePlanWizard';
import { PlansListPage } from '../page-objects/PlansListPage';

const TEST_DATA = {
  planName: 'test-create-plan',
  planProject: 'openshift-mtv',
  sourceProvider: 'test-source-provider',
  targetProvider: 'test-target-provider',
  targetProject: 'test-target-project',
  networkMap: 'test-network-map-1',
  storageMap: 'test-storage-map-1',
};

describe('Create plan wizard', () => {
  const plansPage = new PlansListPage();
  const wizard = new CreatePlanWizard();

  beforeEach(() => {
    // Disable guided tour modal before tests
    cy.disableGuidedTour();

    // Mock all the API endpoints we'll need for the wizard
    setupProjectsIntercepts();
    setupAllProvidersIntercepts();
    setupPlansIntercepts();
    setupProvidersIntercepts();
    setupVirtualMachinesIntercepts('vsphere');
    setupHostsIntercepts('vsphere');
    setupFoldersIntercepts('vsphere');
    setupDatastoresIntercepts('vsphere');
    setupNetworksIntercepts('vsphere', 'test-target-uid-1');
    setupNetworkMapsIntercepts();
    setupStorageMapsIntercepts();
    setupStorageClassesIntercepts('test-target-uid-1');
    setupTargetProviderNamespacesIntercepts('test-target-uid-1');

    // Mock plan creation endpoints
    setupCreateNetworkMapIntercepts();
    setupCreateStorageMapIntercepts();
    setupCreatePlanIntercepts();
    setupPatchNetworkMapOwnerIntercepts();
    setupPatchStorageMapOwnerIntercepts();
    setupPlanDetailsIntercepts();

    // Navigate to the Plans list page
    plansPage.navigateFromMainMenu();
  });

  it('should complete the create plan wizard flow with all steps', () => {
    // Wait for page to load, then click when button becomes ready
    plansPage.waitForPageLoad();
    plansPage.clickCreatePlanButton();
    wizard.verifyWizardOpened();

    // STEP 1: General Information
    wizard.verifyGeneralStepVisible();

    wizard.fillPlanName(TEST_DATA.planName);
    wizard.selectPlanProject(TEST_DATA.planProject);
    wizard.selectSourceProvider(TEST_DATA.sourceProvider);
    wizard.selectTargetProvider(TEST_DATA.targetProvider);
    wizard.waitForTargetProviderNamespaces();
    wizard.selectTargetProject(TEST_DATA.targetProject);
    wizard.clickNext();

    // STEP 2: Virtual Machines
    wizard.waitForVirtualMachinesData();
    wizard.verifyVirtualMachinesStepVisible();
    wizard.verifyVirtualMachinesTableLoaded();
    wizard.selectFirstVirtualMachine();
    wizard.clickNext();

    // STEP 3: Network Map
    wizard.verifyNetworkMapStepVisible();
    wizard.waitForNetworkMaps();
    wizard.selectNetworkMap(TEST_DATA.networkMap);
    wizard.clickNext();

    // STEP 4: Storage Map
    wizard.verifyStorageMapStepVisible();
    wizard.waitForStorageMaps();
    wizard.selectStorageMap(TEST_DATA.storageMap);
    wizard.clickNext();

    // Skip to review step
    wizard.clickReviewAndCreate();

    // STEP 5: Review
    wizard.verifyReviewStepVisible();

    // Verify all review sections
    wizard.verifyGeneralSection({
      planName: TEST_DATA.planName,
      planProject: TEST_DATA.planProject,
      sourceProvider: TEST_DATA.sourceProvider,
      targetProvider: TEST_DATA.targetProvider,
      targetProject: TEST_DATA.targetProject,
    });

    wizard.verifyVirtualMachinesSection();
    wizard.verifyNetworkMapSection(TEST_DATA.networkMap);
    wizard.verifyStorageMapSection(TEST_DATA.storageMap);
    wizard.verifyMigrationTypeSection();
    wizard.verifyOtherSettingsSection();
    wizard.verifyHooksSection();

    // STEP 6: Create the plan
    wizard.clickCreatePlan();
    wizard.waitForPlanCreation();
    wizard.verifyRedirectToPlanDetails(TEST_DATA.planName);
  });
});
