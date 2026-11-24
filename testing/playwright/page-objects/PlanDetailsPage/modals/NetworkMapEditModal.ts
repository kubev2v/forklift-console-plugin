import { expect, type Locator, type Page } from '@playwright/test';

import { BaseMappingEditModal, type MappingModalConfig } from './BaseMappingEditModal';

const MODAL_TEST_ID = 'edit-network-map-modal';
const networkIPModeTestId = (index: number): string => `networkMap.${index}.networkIPMode`;

const getNetworkIPModeTestId = (index: number): string => networkIPModeTestId(index);

/**
 * Page object for the Network Map Edit Modal.
 * Extends BaseMappingEditModal with network-specific configuration.
 */
export class NetworkMapEditModal extends BaseMappingEditModal {
  protected readonly config: MappingModalConfig = {
    modalTestId: MODAL_TEST_ID,
    modalTitle: 'Edit network map',
    sourceTestIdPattern: (index: number) => `source-network-networkMap.${index}.sourceNetwork`,
    targetTestIdPattern: (index: number) => `target-network-networkMap.${index}.targetNetwork`,
  };

  constructor(page: Page) {
    super(page, MODAL_TEST_ID);
  }

  private locateNetworkIPMode(index: number): Locator {
    return this.page.getByTestId(getNetworkIPModeTestId(index));
  }

  async clearNetworkIPModeAtIndex(index: number): Promise<void> {
    await this.page.getByTestId(`networkMap.${index}.networkIPMode-clear`).click();
    await expect(this.networkIPModeAtIndex(index)).toContainText('Inherit');
  }

  async expandNetworkIPModeAtIndex(index: number): Promise<void> {
    const toggle = this.modal
      .getByTestId(`network-ip-mode-row-${index}`)
      .getByRole('button', { name: 'Network IP mode (optional)' });
    await expect(toggle).toBeVisible();
    const expanded = await toggle.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await toggle.click();
      await expect(this.locateNetworkIPMode(index)).toBeVisible();
    }
  }

  async getSourceNetworkAtIndex(index: number): Promise<string> {
    return this.getSourceAtIndex(index);
  }

  async getTargetNetworkAtIndex(index: number): Promise<string> {
    return this.getTargetAtIndex(index);
  }

  networkIPModeAtIndex(index: number): Locator {
    return this.locateNetworkIPMode(index);
  }

  networkIPModeClearButtonAtIndex(index: number): Locator {
    return this.page.getByTestId(`networkMap.${index}.networkIPMode-clear`);
  }

  async selectNetworkIPModeAtIndex(index: number, modeLabel: string): Promise<void> {
    const selector = this.locateNetworkIPMode(index);
    await expect(selector).toBeVisible();
    await selector.click();
    await this.page.getByRole('option', { name: modeLabel }).click();
  }

  async selectSourceNetworkAtIndex(index: number, sourceNetwork: string): Promise<void> {
    return this.selectSourceAtIndex(index, sourceNetwork);
  }

  async selectTargetNetworkAtIndex(index: number, targetNetwork: string): Promise<void> {
    return this.selectTargetAtIndex(index, targetNetwork);
  }

  async verifyNetworkIPModeAtIndex(index: number, expectedText: string): Promise<void> {
    await expect(this.networkIPModeAtIndex(index)).toContainText(expectedText);
  }

  async verifyNetworkIPModeNotVisibleAtIndex(index: number): Promise<void> {
    await expect(this.locateNetworkIPMode(index)).toBeHidden();
  }
}
