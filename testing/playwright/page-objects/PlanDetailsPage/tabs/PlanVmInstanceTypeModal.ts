import type { Locator, Page } from '@playwright/test';

/** Edit instance type modal opened from Plan details → VMs tab kebab menu */
export class PlanVmInstanceTypeModal {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get confirmButton(): Locator {
    return this.root.getByTestId('modal-confirm-button');
  }

  async openFromKebab(
    vmName: string,
    getVmActionsMenu: (name: string) => Locator,
    dismissOpenModals: () => Promise<void>,
  ): Promise<void> {
    await dismissOpenModals();
    await getVmActionsMenu(vmName).click();
    const menuItem = this.page.getByTestId('edit-vm-instance-type-menu-item');
    await menuItem.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(200);
    await menuItem.click({ force: true });
    await this.root.waitFor({ state: 'visible' });
  }

  get root(): Locator {
    return this.page.getByTestId('edit-instance-type-modal');
  }

  get selectToggle(): Locator {
    return this.root.getByTestId('instance-type-select');
  }
}
