import { expect, type Locator, type Page } from '@playwright/test';

/** Per-VM Edit VM wizard on plan details Virtual machines tab. */
export class EditVmWizardModal {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('edit-vm-wizard-modal');
  }

  async advanceToReviewStep(maxSteps = 5): Promise<void> {
    for (let step = 0; step < maxSteps; step += 1) {
      const label = (await this.nextButton.textContent()) ?? '';
      if (/save/iu.test(label)) {
        return;
      }
      await this.nextButton.click();
    }
    await expect(this.reviewStep).toBeVisible();
  }

  get cancelButton(): Locator {
    return this.page.getByTestId('edit-vm-wizard-cancel-button');
  }

  get generalStep(): Locator {
    return this.page.getByTestId('edit-vm-general-step');
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
