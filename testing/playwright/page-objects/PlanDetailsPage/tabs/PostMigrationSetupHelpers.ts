import { expect, type Locator, type Page } from '@playwright/test';

/** Assertions for the "Post-migration setup" (`WaitForGuestReboots`) VM state. */
export class PostMigrationSetupHelpers {
  // Scopes assertions to the VM grid, matching ConcernsHelpers, so page-wide
  // filter chips/options can't be mistaken for the pipeline step or VM row.
  private readonly vmTable: Locator;

  constructor(page: Page) {
    this.vmTable = page.getByRole('grid', { name: 'Virtual machines' });
  }

  /** Expanded VM details row while `WaitForGuestReboots` runs: step name + warning alert. */
  async verifyDetailsVisible(): Promise<void> {
    await expect(this.vmTable.getByText('Post-migration setup', { exact: true })).toBeVisible();
    await expect(this.vmTable.getByText('Do not access this VM')).toBeVisible();
    await expect(
      this.vmTable.getByText(/installing drivers and completing post-migration setup/iu),
    ).toBeVisible();
  }

  /** Asserts the VM name renders as plain text in the table, not a navigable link. */
  async verifyVMNameIsNotLink(vmName: string): Promise<void> {
    await expect(this.vmTable.getByRole('link', { name: vmName, exact: true })).toHaveCount(0);
    await expect(this.vmTable.getByText(vmName, { exact: true })).toBeVisible();
  }
}
