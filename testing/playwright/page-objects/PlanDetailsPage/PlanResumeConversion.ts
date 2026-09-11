import { expect, type Locator, type Page } from '@playwright/test';

export class PlanResumeConversion {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get resumeMenuitem(): Locator {
    return this.page.getByRole('menuitem', { name: /Resume conversion/u });
  }

  get actionsButton(): Locator {
    return this.page.getByTestId('plan-actions-dropdown-button');
  }

  async closeActionsMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.menuItem).toBeHidden();
  }

  async expectMenuItemDisabled(): Promise<void> {
    await expect(this.resumeMenuitem).toBeDisabled();
  }

  async expectMenuItemEnabled(): Promise<void> {
    await expect(this.resumeMenuitem).toBeEnabled();
  }

  get menuItem(): Locator {
    return this.page.getByTestId('plan-actions-resume-conversion-menuitem');
  }

  get modal(): Locator {
    return this.page.getByRole('dialog', { name: 'Resume conversion' });
  }

  get modalCancelButton(): Locator {
    return this.page.getByTestId('modal-cancel-button');
  }

  get modalConfirmButton(): Locator {
    return this.page.getByTestId('modal-confirm-button');
  }

  async openActionsMenu(): Promise<void> {
    await this.actionsButton.click();
    await expect(this.menuItem).toBeVisible();
  }

  async openModalFromStatus(): Promise<void> {
    await this.statusButton.click();
    await expect(this.modal).toBeVisible();
  }

  get statusButton(): Locator {
    return this.page.getByTestId('plan-resume-button-status');
  }
}
