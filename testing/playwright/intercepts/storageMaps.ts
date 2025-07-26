import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupStorageMapsIntercepts = async (page: Page) => {
  const storageMapData = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name: 'test-storage-map-1',
      namespace: 'openshift-mtv',
      uid: 'test-storagemap-uid-1',
    },
    spec: {
      map: [
        {
          destination: {
            storageClass: 'test-storage-class',
          },
          source: {
            id: 'test-storage-id-1',
            name: 'test-datastore-1',
          },
        },
      ],
      provider: {
        destination: {
          name: 'test-target-provider',
          namespace: 'openshift-mtv',
        },
        source: {
          name: 'test-source-provider',
          namespace: 'openshift-mtv',
        },
      },
    },
    status: {
      conditions: [
        {
          type: 'Ready',
          status: 'True',
          message: 'The storage map is ready.',
        },
      ],
    },
  };

  // Individual StorageMap GET request (used for copying existing maps)
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps/${TEST_DATA.storageMap}`,
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(storageMapData),
        });
      } else {
        await route.continue();
      }
    },
  );

  // StorageMap creation for copying (POST request with new name)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps$/,
    async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData() ?? '{}') as {
          metadata?: { name?: string };
        };
        const newName = requestBody.metadata?.name ?? 'copied-storage-map';

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...storageMapData,
            metadata: {
              ...storageMapData.metadata,
              name: newName,
              uid: `copied-storagemap-uid-${Date.now()}`,
            },
          }),
        });
      } else {
        await route.continue();
      }
    },
  );

  // StorageMap PATCH request for adding owner references
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps\/.*$/,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        // Extract the name from URL
        const url = route.request().url();
        const name = url.split('/').pop();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...storageMapData,
            metadata: {
              ...storageMapData.metadata,
              name,
              ownerReferences: [
                {
                  apiVersion: 'forklift.konveyor.io/v1beta1',
                  kind: 'Plan',
                  name: 'test-create-plan',
                  uid: 'test-plan-uid-1',
                },
              ],
            },
          }),
        });
      } else {
        await route.continue();
      }
    },
  );

  await page.route(API_ENDPOINTS.storageMaps, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [storageMapData],
      }),
    });
  });
};
