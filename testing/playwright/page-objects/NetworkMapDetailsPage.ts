import type { Page } from '@playwright/test';

import {
  BaseMapDetailsPage,
  type MapDetailsExpectedData,
  type MapDetailsPageConfig,
} from './common/BaseMapDetailsPage';
import { NetworkMapEditModal } from './PlanDetailsPage/modals/NetworkMapEditModal';

export class NetworkMapDetailsPage extends BaseMapDetailsPage {
  protected readonly config: MapDetailsPageConfig = {
    resourceType: 'NetworkMap',
    mapTypeDisplay: 'Network map',
    editButtonTestId: 'network-map-edit-button',
    readyMessage: 'The network map is ready.',
  };

  public readonly networkMapEditModal: NetworkMapEditModal;

  constructor(page: Page) {
    super(page);
    this.networkMapEditModal = new NetworkMapEditModal(page);
  }

  async openEditModal(): Promise<NetworkMapEditModal> {
    await this.verifyOnDetailsPage();
    await this.editButtonLocator().click();
    await this.networkMapEditModal.waitForModalToOpen();
    await this.page.waitForLoadState('networkidle');
    return this.networkMapEditModal;
  }

  async verifyNetworkMapDetailsPage(expectedData: {
    networkMapName: string;
    sourceProvider: string;
    targetProvider: string;
    mappings?: {
      sourceNetwork: string;
      targetNetwork: string;
    }[];
    status?: 'Ready' | 'NotReady';
  }): Promise<void> {
    const normalizedData: MapDetailsExpectedData = {
      mapName: expectedData.networkMapName,
      sourceProvider: expectedData.sourceProvider,
      targetProvider: expectedData.targetProvider,
      mappings: expectedData.mappings?.map((mapping) => ({
        source: mapping.sourceNetwork,
        target: mapping.targetNetwork,
      })),
      status: expectedData.status,
    };
    await this.verifyMapDetailsPage(normalizedData);
  }
}
