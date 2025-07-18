import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

export const setupStorageMapsIntercepts = async (page: Page) => {
  await page.route(API_ENDPOINTS.storageMaps, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [
          {
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
          },
        ],
      }),
    });
  });
};
