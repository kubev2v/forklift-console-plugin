import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupNetworkMapsIntercepts = async (page: Page) => {
  const networkMapData1 = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name: 'test-network-map-1',
      namespace: 'openshift-mtv',
      uid: 'test-netmap-uid-1',
      ownerReferences: [],
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

  const networkMapData2 = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name: 'test-network-map-2',
      namespace: 'openshift-mtv',
      uid: 'test-netmap-uid-2',
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Plan',
          name: 'test-plan-2',
          uid: 'test-plan-uid-2',
          controller: true,
          blockOwnerDeletion: true,
        },
      ],
    },
    spec: {
      map: [
        {
          destination: {
            type: 'multus',
          },
          source: {
            type: 'bridge',
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
          body: JSON.stringify(networkMapData1),
        });
      } else {
        await route.continue();
      }
    },
  );

  // NetworkMap creation (POST request)
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/(?:openshift-mtv|konveyor-forklift)\/networkmaps$/,
    async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData() ?? '{}') as {
          metadata?: { name?: string; namespace?: string };
          spec?: any;
        };
        const newName = requestBody.metadata?.name ?? 'test-create-network-map';
        const namespace = requestBody.metadata?.namespace ?? 'konveyor-forklift';

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...networkMapData1,
            metadata: {
              ...networkMapData1.metadata,
              name: newName,
              namespace,
              uid: `test-networkmap-uid-${Date.now()}`,
            },
            spec: requestBody.spec ?? networkMapData1.spec,
          }),
        });
      } else {
        await route.continue();
      }
    },
  );

  // NetworkMap GET/PATCH requests
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/(?:openshift-mtv|konveyor-forklift)\/networkmaps\/[^/?]*$/,
    async (route) => {
      const parseUrl = (url: string) => {
        const urlParts = url.split('/');
        const name = urlParts.pop();
        const namespaceIndex = urlParts.indexOf('namespaces') + 1;
        const namespace = urlParts[namespaceIndex];
        return { name, namespace };
      };

      if (route.request().method() === 'GET') {
        const { name, namespace } = parseUrl(route.request().url());

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...networkMapData1,
            metadata: {
              ...networkMapData1.metadata,
              name,
              namespace,
              uid: `test-networkmap-uid-${name}`,
            },
          }),
        });
      } else if (route.request().method() === 'PATCH') {
        const { name, namespace } = parseUrl(route.request().url());

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...networkMapData1,
            metadata: {
              ...networkMapData1.metadata,
              name,
              namespace,
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
        items: [networkMapData1, networkMapData2],
      }),
    });
  });
};
