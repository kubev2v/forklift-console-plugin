import { expect, type Page } from '@playwright/test';

/** Assertions for the "Post-migration setup" (`WaitForGuestReboots`) VM state. */
export class PostMigrationSetupHelpers {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Expanded VM details row while `WaitForGuestReboots` runs: step name + warning alert. */
  async verifyDetailsVisible(): Promise<void> {
    await expect(this.page.getByText('Post-migration setup', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Do not access this VM')).toBeVisible();
    await expect(
      this.page.getByText(/installing drivers and completing post-migration setup/iu),
    ).toBeVisible();
  }

  /** Asserts the VM name renders as plain text in the table, not a navigable link. */
  async verifyVMNameIsNotLink(vmName: string): Promise<void> {
    await expect(this.page.getByRole('link', { name: vmName, exact: true })).toHaveCount(0);
    await expect(this.page.getByText(vmName, { exact: true })).toBeVisible();
  }
}
