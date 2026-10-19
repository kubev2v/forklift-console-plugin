import { expect, type Locator, type Page } from '@playwright/test';

export class EditVmExcludeDisksModal {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('edit-vm-exclude-disks-modal');
  }

  get allDisksWarning(): Locator {
    return this.root.getByText('At least one disk must remain for migration.');
  }

  diskCheckbox(busAddress: string): Locator {
    const table = this.root.getByTestId('exclude-disks-select-table');
    const addressCell = table.getByRole('gridcell', { exact: true, name: busAddress });
    return table.getByRole('row').filter({ has: addressCell }).getByRole('checkbox');
  }

  get saveButton(): Locator {
    return this.root.getByTestId('modal-confirm-button');
  }

  async waitForDisks(busAddresses: string[]): Promise<void> {
    await expect(this.root).toBeVisible();
    await Promise.all(
      busAddresses.map((address) => expect(this.diskCheckbox(address)).toBeVisible()),
    );
  }
}
