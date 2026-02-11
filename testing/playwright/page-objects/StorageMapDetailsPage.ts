import type { Page } from '@playwright/test';

import {
  BaseMapDetailsPage,
  type MapDetailsExpectedData,
  type MapDetailsPageConfig,
} from './common/BaseMapDetailsPage';
import { StorageMapEditModal } from './PlanDetailsPage/modals/StorageMapEditModal';

export class StorageMapDetailsPage extends BaseMapDetailsPage {
  protected readonly config: MapDetailsPageConfig = {
    resourceType: 'StorageMap',
    mapTypeDisplay: 'Storage map',
    editButtonTestId: 'storage-map-edit-button',
    readyMessage: 'The storage map is ready.',
  };

  public readonly storageMapEditModal: StorageMapEditModal;

  constructor(page: Page) {
    super(page);
    this.storageMapEditModal = new StorageMapEditModal(page);
  }

  async openEditModal(): Promise<StorageMapEditModal> {
    await this.verifyOnDetailsPage();
    await this.editButtonLocator().click();
    await this.storageMapEditModal.waitForModalToOpen();
    await this.page.waitForLoadState('networkidle');
    return this.storageMapEditModal;
  }

  async verifyStorageMapDetailsPage(expectedData: {
    storageMapName: string;
    sourceProvider: string;
    targetProvider: string;
    mappings?: {
      sourceStorage: string;
      targetStorage: string;
    }[];
    status?: 'Ready' | 'NotReady';
  }): Promise<void> {
    const normalizedData: MapDetailsExpectedData = {
      mapName: expectedData.storageMapName,
      sourceProvider: expectedData.sourceProvider,
      targetProvider: expectedData.targetProvider,
      mappings: expectedData.mappings?.map((mapping) => ({
        source: mapping.sourceStorage,
        target: mapping.targetStorage,
      })),
      status: expectedData.status,
    };
    await this.verifyMapDetailsPage(normalizedData);
  }
}
