import { expect, type Locator, type Page } from '@playwright/test';

import { K8S_RECONCILE_TIMEOUT } from '../../../utils/resource-manager/constants';

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
    // PF6 marks disabled menu items with pf-m-disabled (CSS class, not the disabled attribute).
    // VM actions are disabled while the plan is Validating or otherwise not editable.
    await expect(menuItem).not.toHaveClass(/pf-m-disabled/, { timeout: K8S_RECONCILE_TIMEOUT });
    await menuItem.click();
    await this.root.waitFor({ state: 'visible' });
  }

  get root(): Locator {
    return this.page.getByTestId('edit-instance-type-modal');
  }

  get selectToggle(): Locator {
    return this.root.getByTestId('instance-type-select');
  }
}
