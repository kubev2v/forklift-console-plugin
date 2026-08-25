import { expect, type Page } from '@playwright/test';

import {
  BaseMapDetailsPage,
  type MapDetailsExpectedData,
  type MapDetailsPageConfig,
} from './common/BaseMapDetailsPage';
import { StorageMapEditModal } from './PlanDetailsPage/modals/StorageMapEditModal';

export class StorageMapDetailsPage extends BaseMapDetailsPage {
  protected readonly config: MapDetailsPageConfig = {
    editButtonTestId: 'storage-map-edit-button',
    mapTypeDisplay: 'Storage map',
    readyMessage: 'The storage map is ready.',
    resourceType: 'StorageMap',
  };

  public readonly storageMapEditModal: StorageMapEditModal;

  constructor(page: Page) {
    super(page);
    this.storageMapEditModal = new StorageMapEditModal(page);
  }

  async openEditModal(): Promise<StorageMapEditModal> {
    await this.verifyOnDetailsPage();
    const editButton = this.editButtonLocator();
    // Edit stays disabled until source/destination providers resolve (uid present).
    await expect(editButton).toBeEnabled({ timeout: 30_000 });
    await editButton.click();
    await this.storageMapEditModal.waitForModalToOpen();
    await this.page.waitForLoadState('domcontentloaded');
    return this.storageMapEditModal;
  }

  async verifyStorageMapDetailsPage(expectedData: {
    mappings?: {
      sourceStorage: string;
      targetStorage: string;
    }[];
    sourceProvider: string;
    status?: 'Ready' | 'NotReady';
    storageMapName: string;
    targetProvider: string;
  }): Promise<void> {
    const normalizedData: MapDetailsExpectedData = {
      mapName: expectedData.storageMapName,
      mappings: expectedData.mappings?.map((mapping) => ({
        source: mapping.sourceStorage,
        target: mapping.targetStorage,
      })),
      sourceProvider: expectedData.sourceProvider,
      status: expectedData.status,
      targetProvider: expectedData.targetProvider,
    };
    await this.verifyMapDetailsPage(normalizedData);
  }
}
