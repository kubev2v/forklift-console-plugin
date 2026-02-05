import { BaseMappingEditModal, type MappingModalConfig } from './BaseMappingEditModal';

/**
 * Page object for the Storage Map Edit Modal.
 * Extends BaseMappingEditModal with storage-specific configuration.
 */
export class StorageMapEditModal extends BaseMappingEditModal {
  protected readonly config: MappingModalConfig = {
    modalTestId: 'edit-storage-map-modal',
    modalTitle: 'Edit storage map',
    sourceTestIdPattern: (index: number) => `source-storage-storageMap.${index}.sourceStorage`,
    targetTestIdPattern: (index: number) => `target-storage-storageMap.${index}.targetStorage`,
  };

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
