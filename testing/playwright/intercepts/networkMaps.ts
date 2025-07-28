import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupNetworkMapsIntercepts = async (page: Page) => {
  const networkMapData = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name: 'test-network-map-1',
      namespace: 'openshift-mtv',
      uid: 'test-netmap-uid-1',
    },
    spec: {
      map: [
        {
          destination: {
            type: 'pod',
          },
          source: {
            type: 'pod',
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
          message: 'The network map is ready.',
        },
      ],
    },
  };

  // Individual NetworkMap GET request (used for copying existing maps)
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps/${TEST_DATA.networkMap}`,
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(networkMapData),
        });
      } else {
        await route.continue();
      }
    },
  );

  // NetworkMap creation for copying (POST request with new name)
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/networkmaps$/,
    async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData() ?? '{}') as {
          metadata?: { name?: string };
        };
        const newName = requestBody.metadata?.name ?? 'copied-network-map';

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...networkMapData,
            metadata: {
              ...networkMapData.metadata,
              name: newName,
              uid: `copied-netmap-uid-${Date.now()}`,
            },
          }),
        });
      } else {
        await route.continue();
      }
    },
  );

  // NetworkMap PATCH request for adding owner references
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/networkmaps\/[^/?]*$/,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        // Extract the name from URL
        const url = route.request().url();
        const name = url.split('/').pop();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...networkMapData,
            metadata: {
              ...networkMapData.metadata,
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

  await page.route(API_ENDPOINTS.networkMaps, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [networkMapData],
      }),
    });
  });
};
