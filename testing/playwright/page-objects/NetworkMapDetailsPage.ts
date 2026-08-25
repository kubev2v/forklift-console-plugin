import type { Page } from '@playwright/test';

import {
  BaseMapDetailsPage,
  type MapDetailsExpectedData,
  type MapDetailsPageConfig,
} from './common/BaseMapDetailsPage';
import { NetworkMapEditModal } from './PlanDetailsPage/modals/NetworkMapEditModal';

export class NetworkMapDetailsPage extends BaseMapDetailsPage {
  protected readonly config: MapDetailsPageConfig = {
    editButtonTestId: 'network-map-edit-button',
    mapTypeDisplay: 'Network map',
    readyMessage: 'The network map is ready.',
    resourceType: 'NetworkMap',
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
    await this.page.waitForLoadState('domcontentloaded');
    return this.networkMapEditModal;
  }

  async verifyNetworkMapDetailsPage(expectedData: {
    mappings?: {
      sourceNetwork: string;
      targetNetwork: string;
    }[];
    networkMapName: string;
    sourceProvider: string;
    status?: 'Ready' | 'NotReady';
    targetProvider: string;
  }): Promise<void> {
    const normalizedData: MapDetailsExpectedData = {
      mapName: expectedData.networkMapName,
      mappings: expectedData.mappings?.map((mapping) => ({
        source: mapping.sourceNetwork,
        target: mapping.targetNetwork,
      })),
      sourceProvider: expectedData.sourceProvider,
      status: expectedData.status,
      targetProvider: expectedData.targetProvider,
    };
    await this.verifyMapDetailsPage(normalizedData);
  }
}
