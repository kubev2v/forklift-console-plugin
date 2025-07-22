import { expect, type Page } from '@playwright/test';

import { GeneralInformationStep } from './steps/GeneralInformationStep';
import { NetworkMapStep } from './steps/NetworkMapStep';
import { ReviewStep } from './steps/ReviewStep';
import { StorageMapStep } from './steps/StorageMapStep';
import { VirtualMachinesStep } from './steps/VirtualMachinesStep';

export class CreatePlanWizardPage {
  public readonly generalInformation: GeneralInformationStep;
  public readonly networkMap: NetworkMapStep;
  protected readonly page: Page;
  public readonly review: ReviewStep;
  public readonly storageMap: StorageMapStep;
  public readonly virtualMachines: VirtualMachinesStep;

  constructor(page: Page) {
    this.page = page;
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

  async waitForPlanCreation() {
    // Wait for the plan creation to complete and navigate away from wizard
    await this.page.waitForURL(/forklift\.konveyor\.io~v1beta1~Plan\/[^/]+/, {
      timeout: 30000,
    });
  }

  async waitForWizardLoad() {
    expect(this.page.url()).toContain('forklift.konveyor.io~v1beta1~Plan/~new');
    await expect(this.page.getByTestId('create-plan-wizard')).toBeVisible();
  }
}
