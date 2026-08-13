import { expect, type Page, test } from '@playwright/test';

import { TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts';
import { StorageMapCreatePage } from '../../page-objects/StorageMapCreatePage';
import { StorageMapDetailsPage } from '../../page-objects/StorageMapDetailsPage';
import { StorageMapsListPage } from '../../page-objects/StorageMapsListPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

const FORKLIFT_CONTROLLER_RESPONSE = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'ForkliftControllerList',
  metadata: { continue: '', remainingItemCount: 0, resourceVersion: '1000' },
  items: [
    {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'ForkliftController',
      metadata: {
        name: 'forklift-controller',
        namespace: 'konveyor-forklift',
        uid: 'fc-uid-1',
        resourceVersion: '999',
      },
      // eslint-disable-next-line camelcase
      spec: { feature_copy_offload: true },
    },
  ],
};

const setupForkliftControllerIntercept = async (page: Page): Promise<void> => {
  await page.route(
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/*/forkliftcontrollers*',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FORKLIFT_CONTROLLER_RESPONSE),
      });
    },
  );
};

type CreatedStorageMap = {
  apiVersion: string;
  kind: string;
  metadata: {
    creationTimestamp?: string;
    name?: string;
    namespace?: string;
    uid?: string;
  };
  spec?: unknown;
  status?: {
    conditions?: { message?: string; status?: string; type?: string }[];
  };
};

const setupCreatedStorageMapIntercepts = async (page: Page): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let createdMap: CreatedStorageMap | undefined;

  await page.route(
    /\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/storagemaps$/,
    async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData() ?? '{}') as CreatedStorageMap;
        createdMap = {
          ...requestBody,
          metadata: {
            ...requestBody.metadata,
            creationTimestamp: new Date().toISOString(),
            uid: 'test-duplicate-source-storagemap-uid',
          },
          status: {
            conditions: [
              {
                message: 'The storage map is ready.',
                status: 'True',
                type: 'Ready',
              },
            ],
          },
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(createdMap),
        });
        return;
      }

      await route.continue();
    },
  );

  await page.route(
    /\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/[^/]+\/storagemaps\/[^/?]+$/,
    async (route) => {
      if (route.request().method() === 'GET' && createdMap) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(createdMap),
        });
        return;
      }

      await route.continue();
    },
  );
};

test.describe(
  'Storage Map Create - Duplicate source storage (MTV-6324)',
  { tag: '@upstream' },
  () => {
    test.beforeEach(async ({ page }) => {
      await setupForkliftIntercepts(page);
      await setupForkliftControllerIntercept(page);
      await setupCreatedStorageMapIntercepts(page);
    });

    test('allows duplicate source storages, uncapped Add, and create with shared source (MTV-6324)', async ({
      page,
    }) => {
      const storageMapsListPage = new StorageMapsListPage(page);
      const storageMapCreatePage = new StorageMapCreatePage(page);
      const storageMapDetailsPage = new StorageMapDetailsPage(page);
      const sharedSource = TEST_DATA.datastores[0].name;
      const firstTarget = TEST_DATA.storageClasses[0].name;
      const secondTarget = TEST_DATA.storageClasses[1].name;
      const mapName = 'test-duplicate-source-storage-map';
      const addMappingButton = page.getByTestId('add-mapping-button');

      await test.step('navigate and fill providers', async () => {
        await storageMapsListPage.navigate(MTV_NAMESPACE);
        await storageMapsListPage.clickCreateWithFormButton();
        await storageMapCreatePage.waitForPageLoad();
        await storageMapCreatePage.fillMapName(mapName);
        await storageMapCreatePage.selectProject(MTV_NAMESPACE);
        await storageMapCreatePage.selectSourceProvider(TEST_DATA.providers.source.name);
        await storageMapCreatePage.selectTargetProvider(TEST_DATA.providers.target.name);
        await storageMapCreatePage.waitForMappingTableReady();
      });

      await test.step('map first row; Add stays enabled when rows === sources.length', async () => {
        await storageMapCreatePage.selectSourceStorageAtIndex(0, sharedSource);
        await storageMapCreatePage.selectTargetStorageAtIndex(0, firstTarget);
        // Inventory fixture exposes one datastore — one filled row equals source count.
        await expect(addMappingButton).toBeEnabled();
      });

      await test.step('add second mapping with same source and different target', async () => {
        await storageMapCreatePage.addMapping();
        await expect(page.getByTestId('field-row-1')).toBeVisible();
        await storageMapCreatePage.expectSourceStorageOptionEnabled(1, sharedSource);
        await storageMapCreatePage.selectSourceStorageAtIndex(1, sharedSource);
        await storageMapCreatePage.selectTargetStorageAtIndex(1, secondTarget);
        await expect(page.getByTestId('source-storage-storageMap.1.sourceStorage')).toContainText(
          sharedSource,
        );
      });

      await test.step('Add remains enabled beyond inventory size; third row proves uncapping', async () => {
        await expect(addMappingButton).toBeEnabled();
        await storageMapCreatePage.addMapping();
        await expect(page.getByTestId('field-row-2')).toBeVisible();
        // Remove the empty third row before create so validation stays clean.
        await page.getByTestId('remove-row-2').click();
        await expect(page.getByTestId('field-row-2')).toHaveCount(0);
      });

      await test.step('submit and verify details page shows both shared-source mappings', async () => {
        await expect(storageMapCreatePage.createButton).toBeEnabled();
        await storageMapCreatePage.submitForm(mapName);
        await storageMapDetailsPage.verifyStorageMapDetailsPage({
          mappings: [
            { sourceStorage: sharedSource, targetStorage: firstTarget },
            { sourceStorage: sharedSource, targetStorage: secondTarget },
          ],
          sourceProvider: TEST_DATA.providers.source.name,
          storageMapName: mapName,
          targetProvider: TEST_DATA.providers.target.name,
        });
      });
    });
  },
);
