import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Wraps the generic `DeleteModal` component (src/components/modals/DeleteModal/DeleteModal.tsx),
 * shared by the Provider, NetworkMap, and StorageMap delete actions.
 *
 * Unlike `BaseModal`-based modals (which use `ModalForm` and expose `modal-confirm-button` /
 * `modal-cancel-button` test-ids), this modal's buttons carry no test-ids, so it locates them
 * by role/name scoped to the dialog.
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
