import { expect, type Page } from '@playwright/test';

import { BaseMappingEditModal, type MappingModalConfig } from './BaseMappingEditModal';

const MODAL_TEST_ID = 'edit-network-map-modal';
const NETWORK_IP_MODE_TEST_ID = (index: number): string => `networkMap.${index}.networkIPMode`;

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

  async getSourceNetworkAtIndex(index: number): Promise<string> {
    return this.getSourceAtIndex(index);
  }

  async getTargetNetworkAtIndex(index: number): Promise<string> {
    return this.getTargetAtIndex(index);
  }

  async selectSourceNetworkAtIndex(index: number, sourceNetwork: string): Promise<void> {
    return this.selectSourceAtIndex(index, sourceNetwork);
  }

  async selectTargetNetworkAtIndex(index: number, targetNetwork: string): Promise<void> {
    return this.selectTargetAtIndex(index, targetNetwork);
  }

  async selectNetworkIPModeAtIndex(index: number, modeLabel: string): Promise<void> {
    const selector = this.page.getByTestId(NETWORK_IP_MODE_TEST_ID(index));
    await expect(selector).toBeVisible();
    await selector.click();
    await this.page.getByRole('option', { name: modeLabel }).click();
  }

  async verifyNetworkIPModeNotVisibleAtIndex(index: number): Promise<void> {
    await expect(this.page.getByTestId(NETWORK_IP_MODE_TEST_ID(index))).toBeHidden();
  }
}
