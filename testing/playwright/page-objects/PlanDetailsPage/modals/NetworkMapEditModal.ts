import { BaseMappingEditModal, type MappingModalConfig } from './BaseMappingEditModal';

/**
 * Page object for the Network Map Edit Modal.
 * Extends BaseMappingEditModal with network-specific configuration.
 */
export class NetworkMapEditModal extends BaseMappingEditModal {
  protected readonly config: MappingModalConfig = {
    modalTestId: 'edit-network-map-modal',
    modalTitle: 'Edit network map',
    sourceTestIdPattern: (index: number) => `source-network-networkMap.${index}.sourceNetwork`,
    targetTestIdPattern: (index: number) => `target-network-networkMap.${index}.targetNetwork`,
  };

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
}
