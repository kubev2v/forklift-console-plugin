import { expect, type Locator, type Page } from '@playwright/test';

/** Per-VM Edit VM wizard on plan details Virtual machines tab. */
export class EditVmWizardModal {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('edit-vm-wizard-modal');
  }

  private async navigateBackToStep(step: Locator, maxBackClicks: number): Promise<void> {
    if (await step.isVisible()) {
      return;
    }
    for (let click = 0; click < maxBackClicks; click += 1) {
      await this.backButton.click();
      if (await step.isVisible()) {
        return;
      }
    }
    await expect(step).toBeVisible();
  }

  async advanceToNamingTemplatesStep(): Promise<void> {
    await this.nextButton.click();
    await expect(this.page.getByTestId('edit-vm-disks-step')).toBeVisible();
    await this.nextButton.click();
    await expect(this.namingTemplatesStep).toBeVisible();
  }

  async advanceToReviewStep(maxSteps = 5): Promise<void> {
    for (let step = 0; step < maxSteps; step += 1) {
      const label = (await this.nextButton.textContent()) ?? '';
      if (/save/iu.test(label)) {
        return;
      }
      const currentStep = this.root.locator('[aria-current="step"]');
      const previousStepName = (await currentStep.textContent()) ?? '';
      await this.nextButton.click();
      await expect(currentStep).not.toHaveText(previousStepName);
    }
    await expect(this.reviewStep).toBeVisible();
  }

  get backButton(): Locator {
    return this.page.getByTestId('edit-vm-wizard-back-button');
  }

  get cancelButton(): Locator {
    return this.page.getByTestId('edit-vm-wizard-cancel-button');
  }

  get disksStep(): Locator {
    return this.page.getByTestId('edit-vm-disks-step');
  }

  get generalStep(): Locator {
    return this.page.getByTestId('edit-vm-general-step');
  }

  get namingTemplatesStep(): Locator {
    return this.page.getByTestId('edit-vm-naming-templates-step');
  }

  async navigateToDisksStep(maxBackClicks = 5): Promise<void> {
    await this.navigateBackToStep(this.disksStep, maxBackClicks);
  }

  async navigateToGeneralStep(maxBackClicks = 5): Promise<void> {
    await this.navigateBackToStep(this.generalStep, maxBackClicks);
  }

  get nextButton(): Locator {
    return this.page.getByTestId('edit-vm-wizard-next-button');
  }

  get reviewStep(): Locator {
    return this.page.getByTestId('edit-vm-review-step');
  }

  async save(): Promise<void> {
    await expect(this.nextButton).toHaveText(/save/iu);
    await this.nextButton.click();
    await expect(this.root).not.toBeVisible();
  }
}
