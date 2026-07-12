import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Wraps the generic `DeleteModal` component, shared by Provider/NetworkMap/StorageMap delete.
 * Its buttons carry no test-ids, so they're located by role/name within the dialog.
 */
export class DeleteResourceModal {
  private readonly dialog: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog');
  }

  async cancel(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await this.waitForModalToClose();
  }

  async confirm(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await this.waitForModalToClose();
  }

  async verifyOpen(resourceName: string): Promise<void> {
    await expect(this.dialog).toBeVisible();
    await expect(this.dialog).toContainText(resourceName);
  }

  async waitForModalToClose(): Promise<void> {
    await expect(this.dialog).not.toBeVisible();
  }
}
