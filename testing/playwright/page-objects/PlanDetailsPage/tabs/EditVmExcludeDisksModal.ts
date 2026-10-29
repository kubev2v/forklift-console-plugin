import { expect, type Locator, type Page } from '@playwright/test';

import { EditVmWizardModal } from './EditVmWizardModal';

export class EditVmExcludeDisksModal {
  readonly page: Page;
  readonly root: Locator;
  readonly wizard: EditVmWizardModal;

  constructor(page: Page) {
    this.page = page;
    this.wizard = new EditVmWizardModal(page);
    this.root = this.wizard.root;
  }

  get allDisksWarning(): Locator {
    return this.page.getByText('At least one disk must remain for migration.');
  }

  diskCheckbox(busAddress: string): Locator {
    const table = this.page.getByTestId('exclude-disks-select-table');
    return table.getByRole('row').filter({ hasText: busAddress }).getByRole('checkbox');
  }

  get disksStep(): Locator {
    return this.page.getByTestId('edit-vm-disks-step');
  }

  get saveButton(): Locator {
    return this.wizard.nextButton;
  }

  async saveFromDisksStep(): Promise<void> {
    await this.wizard.advanceToReviewStep();
    await this.wizard.save();
  }

  async waitForDisks(busAddresses: string[]): Promise<void> {
    await expect(this.disksStep).toBeVisible();
    await Promise.all(
      busAddresses.map((address) => expect(this.diskCheckbox(address)).toBeVisible()),
    );
  }
}
