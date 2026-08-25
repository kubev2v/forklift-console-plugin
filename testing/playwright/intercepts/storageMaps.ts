import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export const setupStorageMapsIntercepts = async (page: Page) => {
  const storageMapData1 = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name: 'test-storage-map-1',
      namespace: MTV_NAMESPACE,
      ownerReferences: [],
      uid: 'test-storagemap-uid-1',
    },
    spec: {
      map: [
        {
          destination: {
            accessMode: 'ReadWriteOnce',
            storageClass: 'test-ceph-rbd',
          },
          source: {
            id: 'test-datastore-1',
          },
        },
      ],
      provider: {
        destination: {
          name: 'test-target-provider',
          namespace: MTV_NAMESPACE,
        },
        source: {
          name: 'test-source-provider',
          namespace: MTV_NAMESPACE,
        },
      },
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

  const storageMapData2 = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name: 'test-storage-map-2',
      namespace: MTV_NAMESPACE,
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          blockOwnerDeletion: true,
          controller: true,
          kind: 'Plan',
          name: 'test-plan-2',
          uid: 'test-plan-uid-2',
        },
      ],
      uid: 'test-storagemap-uid-2',
    },
    spec: {
      map: [
        {
          destination: {
            accessMode: 'ReadWriteOnce',
            storageClass: 'test-ceph-rbd',
          },
          source: {
            id: 'test-datastore-2',
          },
        },
      ],
      provider: {
        destination: {
          name: 'test-target-provider',
          namespace: MTV_NAMESPACE,
        },
        source: {
          name: 'test-source-provider',
          namespace: MTV_NAMESPACE,
        },
      },
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

  // Individual StorageMap GET request (used for copying existing maps)
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps/${TEST_DATA.storageMap}`,
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          body: JSON.stringify(storageMapData1),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );

  // StorageMap creation for copying (POST request with new name)
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps$/u,
    async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData() ?? '{}') as {
          metadata?: { name?: string };
        };
        const newName = requestBody.metadata?.name ?? 'test-create-plan-storagemap';

        await route.fulfill({
          body: JSON.stringify({
            ...storageMapData1,
            metadata: {
              ...storageMapData1.metadata,
              name: newName,
              uid: `test-storagemap-uid-${crypto.randomUUID().slice(0, 8)}`,
            },
          }),
          contentType: 'application/json',
          status: 201,
        });
      } else {
        await route.continue();
      }
    },
  );

  // StorageMap PATCH request for adding owner references
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps\/[^/?]*$/u,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        // Extract the name from URL
        const url = route.request().url();
        const name = url.split('/').pop();

        await route.fulfill({
          body: JSON.stringify({
            ...storageMapData1,
            metadata: {
              ...storageMapData1.metadata,
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
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );

  await page.route(API_ENDPOINTS.storageMaps, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [storageMapData1, storageMapData2],
      }),
      contentType: 'application/json',
      status: 200,
    });
  });
};
