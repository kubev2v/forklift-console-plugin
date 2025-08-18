import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../types/test-data';
import type { ResourceManager } from '../../utils/ResourceManager';

import { GeneralInformationStep } from './steps/GeneralInformationStep';
import { NetworkMapStep } from './steps/NetworkMapStep';
import { ReviewStep } from './steps/ReviewStep';
import { StorageMapStep } from './steps/StorageMapStep';
import { VirtualMachinesStep } from './steps/VirtualMachinesStep';

export class CreatePlanWizardPage {
  private readonly resourceManager?: ResourceManager;
  public readonly generalInformation: GeneralInformationStep;
  public readonly networkMap: NetworkMapStep;
  protected readonly page: Page;
  public readonly review: ReviewStep;
  public readonly storageMap: StorageMapStep;
  public readonly virtualMachines: VirtualMachinesStep;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
    this.generalInformation = new GeneralInformationStep(page);
    this.virtualMachines = new VirtualMachinesStep(page);
    this.networkMap = new NetworkMapStep(page);
    this.storageMap = new StorageMapStep(page);
    this.review = new ReviewStep(page);
  }

  async clickBack() {
    await this.page.getByTestId('wizard-back-button').click();
  }

  async clickCreatePlan() {
    await this.page.getByTestId('wizard-create-button').click();
  }

  async clickNext() {
    await this.page.getByTestId('wizard-next-button').click();
  }

  async clickSkipToReview() {
    await this.page.getByTestId('wizard-review-button').click();
  }

  async fillAndSubmit(testData: PlanTestData, { skipToReview = true } = {}): Promise<void> {
    // STEP 1: General Information
    await this.generalInformation.fillPlanName(testData.planName);
    await this.generalInformation.selectPlanProject(testData.planProject);
    await this.generalInformation.selectSourceProvider(testData.sourceProvider);
    await this.generalInformation.selectTargetProvider(testData.targetProvider);
    await this.generalInformation.waitForTargetProviderNamespaces();
    await this.generalInformation.selectTargetProject(testData.targetProject);
    await this.clickNext();

    // STEP 2: Virtual Machines
    await this.virtualMachines.verifyStepVisible();
    await this.virtualMachines.verifyTableLoaded();
    await this.virtualMachines.selectFirstVirtualMachine();
    await this.clickNext();

    // STEP 3: Network Map
    await this.networkMap.verifyStepVisible();
    await this.networkMap.waitForData();
    await this.networkMap.selectNetworkMap(testData.networkMap);
    await this.clickNext();

    // STEP 4: Storage Map
    await this.storageMap.verifyStepVisible();
    await this.storageMap.waitForData();
    await this.storageMap.selectStorageMap(testData.storageMap);
    await this.clickNext();

    // Skip to review or go through all steps
    if (skipToReview) {
      await this.clickSkipToReview();
    }

    // STEP 5: Review
    await this.review.verifyStepVisible();
    await this.review.verifyAllSections(testData);

    if (this.resourceManager && testData.planName) {
      this.resourceManager.addResource({
        namespace: 'openshift-mtv',
        resourceType: 'plans',
        resourceName: testData.planName,
      });

      if (testData.networkMap && !testData.networkMap.isPreExisting) {
        this.resourceManager.addResource({
          namespace: 'openshift-mtv',
          resourceType: 'networkmaps',
          resourceName: `${testData.planName}-network-map`,
        });
      }

      if (testData.storageMap && !testData.storageMap.isPreExisting) {
        this.resourceManager.addResource({
          namespace: 'openshift-mtv',
          resourceType: 'storagemaps',
          resourceName: `${testData.planName}-storage-map`,
        });
      }
    }

    // STEP 6: Create the plan
    await this.clickNext();
    await this.waitForPlanCreation();
  }

  async waitForPlanCreation() {
    // Wait for the plan creation to complete and navigate away from wizard
    // Use string contains check instead of regex to avoid ReDoS vulnerability
    await this.page.waitForURL(
      (url) => url.toString().includes('forklift.konveyor.io~v1beta1~Plan/'),
      {
        timeout: 30000,
      },
    );
  }

  async waitForWizardLoad() {
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan/~new');
    await expect(this.page.getByTestId('create-plan-wizard')).toBeVisible();
  }
}
