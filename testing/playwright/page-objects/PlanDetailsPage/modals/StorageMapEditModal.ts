import type { Page } from '@playwright/test';

import { BaseMappingEditModal, type MappingModalConfig } from './BaseMappingEditModal';

const MODAL_TEST_ID = 'edit-storage-map-modal';

/**
 * Page object for the Storage Map Edit Modal.
 * Extends BaseMappingEditModal with storage-specific configuration.
 */
export class StorageMapEditModal extends BaseMappingEditModal {
  protected readonly config: MappingModalConfig = {
    modalTestId: MODAL_TEST_ID,
    modalTitle: 'Edit storage map',
    sourceTestIdPattern: (index: number) => `source-storage-storageMap.${index}.sourceStorage`,
    targetTestIdPattern: (index: number) => `target-storage-storageMap.${index}.targetStorage`,
  };

  constructor(page: Page) {
    super(page, MODAL_TEST_ID);
  }

  async getSourceStorageAtIndex(index: number): Promise<string> {
    return this.getSourceAtIndex(index);
  }

  async getTargetStorageAtIndex(index: number): Promise<string> {
    return this.getTargetAtIndex(index);
  }

  async selectSourceStorageAtIndex(index: number, sourceStorage: string): Promise<void> {
    return this.selectSourceAtIndex(index, sourceStorage);
  }

  async selectTargetStorageAtIndex(index: number, targetStorage: string): Promise<void> {
    return this.selectTargetAtIndex(index, targetStorage);
  }
}
