import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../types/test-data';
import { NavigationHelper } from '../../utils/NavigationHelper';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import type { ResourceManager } from '../../utils/resource-manager/ResourceManager';
import { isVersionAtLeast, V2_11_0 } from '../../utils/version';

import { AdditionalSettingsStep } from './steps/AdditionalSettingsSteps';
import { GeneralInformationStep } from './steps/GeneralInformationStep';
import { HooksStep } from './steps/HooksStep';
import { MigrationTypeStep } from './steps/MigrationTypeStep';
import { NetworkMapStep } from './steps/NetworkMapStep';
import { ReviewStep } from './steps/ReviewStep';
import { StorageMapStep } from './steps/StorageMapStep';
import { VirtualMachinesStep } from './steps/VirtualMachinesStep';

export class CreatePlanWizardPage {
  private readonly resourceManager?: ResourceManager;
  public readonly additionalSettings: AdditionalSettingsStep;
  public readonly generalInformation: GeneralInformationStep;
  public readonly hooks: HooksStep;
  public readonly migrationType: MigrationTypeStep;
  public readonly navigationHelper: NavigationHelper;
  public readonly networkMap: NetworkMapStep;
  protected readonly page: Page;
  public readonly review: ReviewStep;
  public readonly storageMap: StorageMapStep;
  public readonly virtualMachines: VirtualMachinesStep;

  constructor(page: Page, resourceManager?: ResourceManager) {
    this.page = page;
    this.resourceManager = resourceManager;
    this.navigationHelper = new NavigationHelper(page);
    this.generalInformation = new GeneralInformationStep(page, resourceManager);
    this.virtualMachines = new VirtualMachinesStep(page);
    this.networkMap = new NetworkMapStep(page);
    this.storageMap = new StorageMapStep(page);
    this.migrationType = new MigrationTypeStep(page);
    this.hooks = new HooksStep(page);
    this.review = new ReviewStep(page);
    this.additionalSettings = new AdditionalSettingsStep(page);
  }

  private addPlanToResourceManager(testData: PlanTestData): void {
    if (!this.resourceManager || !testData.planName) {
      return;
    }
    this.resourceManager.addPlan(testData.planName, testData.planProject ?? MTV_NAMESPACE);
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

  async expectPlanNameValidationError() {
    await expect(
      this.page
        .getByRole('group', { name: 'Plan information' })
        .getByTestId('form-validation-error'),
    ).toBeVisible();
  }

  async expectVirtualMachinesStepVisible() {
    await expect(this.page.locator('[data-testid="virtual-machines-step"]')).toBeVisible();
  }

  async fillAndSubmit(testData: PlanTestData): Promise<void> {
    // STEP 1: General Information
    await this.generalInformation.fillAndComplete(testData);
    await this.clickNext();

    // STEP 2: Virtual Machines
    await this.virtualMachines.fillAndComplete(testData.virtualMachines);
    await this.clickNext();

    // Handle critical issues modal if it appears (after clicking Next)
    if (testData.criticalIssuesAction) {
      await this.virtualMachines.handleCriticalIssuesModal(testData.criticalIssuesAction);
    }

    // STEP 3: Network Map
    await this.networkMap.fillAndComplete(testData.networkMap);
    await this.clickNext();

    // STEP 4: Storage Map
    await this.storageMap.fillAndComplete(testData.storageMap);
    await this.clickNext();

    // STEP 5: Migration Type
    if (testData.migrationType) {
      await this.migrationType.selectMigrationType(testData.migrationType);
    }
    await this.clickNext();

    // STEP 6: Other settings
    if (testData.additionalPlanSettings) {
      await this.additionalSettings.fillAndComplete(testData.additionalPlanSettings);
      await this.clickNext();
    } else if (isVersionAtLeast(V2_11_0)) {
      await this.clickSkipToReview();
    } else {
      // <2.11: no "Skip to Review" button — click Next through remaining steps
      await this.clickNext(); // Other settings → Hooks
      await this.clickNext(); // Hooks → Review
    }

    // STEP 7: Review
    await this.review.verifyReviewStep(testData);

    // STEP 8: Create the plan
    await this.clickNext();
    await this.waitForPlanCreation();

    if (this.resourceManager && testData.planName) {
      this.addPlanToResourceManager(testData);
    }
  }

  async navigate(): Promise<void> {
    await this.navigationHelper.navigateToK8sResource({
      resource: 'Plan',
      action: 'new',
      allNamespaces: true,
    });
  }

  async navigateToAdditionalSettings(testData: PlanTestData): Promise<void> {
    await this.navigateToMigrationTypeStep(testData);
    await this.clickNext(); // Skip Migration Type Step -> goes to Other Settings
    await this.additionalSettings.verifyStepVisible();
  }

  async navigateToHooksStep(testData: PlanTestData): Promise<void> {
    await this.navigateToAdditionalSettings(testData);
    await this.clickNext(); // Skip Other Settings Step -> goes to Hooks
  }

  async navigateToMigrationTypeStep(testData: PlanTestData): Promise<void> {
    await this.generalInformation.fillAndComplete(testData);
    await this.clickNext();
    await this.virtualMachines.fillAndComplete(testData.virtualMachines);
    await this.clickNext();

    // Handle critical issues modal if it appears (after clicking Next)
    if (testData.criticalIssuesAction) {
      await this.virtualMachines.handleCriticalIssuesModal(testData.criticalIssuesAction);
    }

    await this.networkMap.fillAndComplete(testData.networkMap);
    await this.clickNext();
    await this.storageMap.fillAndComplete(testData.storageMap);
    await this.clickNext();
  }

  async waitForPlanCreation() {
    await this.page.waitForURL(
      (url) => url.toString().includes('forklift.konveyor.io~v1beta1~Plan/'),
      {
        timeout: 30000,
      },
    );
  }

  async waitForWizardLoad() {
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan/~new');
    if (isVersionAtLeast(V2_11_0)) {
      await expect(this.page.getByTestId('create-plan-wizard')).toBeVisible();
    } else {
      const wizardStep = this.page
        .getByTestId('plan-name-input')
        .or(this.page.getByRole('group', { name: /Plan information/i }));
      await expect(wizardStep.first()).toBeVisible();
    }
  }
}
