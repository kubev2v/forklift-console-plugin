import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export const setupNetworkMapsIntercepts = async (page: Page) => {
  const networkMapData1 = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      creationTimestamp: '2024-01-15T10:30:00Z',
      name: 'test-network-map-1',
      namespace: MTV_NAMESPACE,
      ownerReferences: [],
      uid: 'test-netmap-uid-1',
    },
    spec: {
      map: [
        {
          destination: {
            name: 'Default network',
            type: 'pod',
          },
          source: {
            id: 'test-network-1-uid',
            name: TEST_DATA.networks[0].name,
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
          message: 'The network map is ready.',
          status: 'True',
          type: 'Ready',
        },
      ],
    },
  };

  const networkMapData2 = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      creationTimestamp: '2024-01-15T10:35:00Z',
      name: 'test-network-map-2',
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
      uid: 'test-netmap-uid-2',
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
          message: 'The network map is ready.',
          status: 'True',
          type: 'Ready',
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
          body: JSON.stringify(networkMapData1),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );

  // NetworkMap creation (POST request)
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/(?:openshift-mtv|konveyor-forklift)\/networkmaps$/u,
    async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = JSON.parse(route.request().postData() ?? '{}') as {
          metadata?: { name?: string; namespace?: string };
          spec?: unknown;
        };
        const newName = requestBody.metadata?.name ?? 'test-create-network-map';
        const namespace = requestBody.metadata?.namespace ?? 'konveyor-forklift';

        await route.fulfill({
          body: JSON.stringify({
            ...networkMapData1,
            metadata: {
              ...networkMapData1.metadata,
              creationTimestamp: new Date().toISOString(),
              name: newName,
              namespace,
              uid: `test-networkmap-uid-${crypto.randomUUID().slice(0, 8)}`,
            },
            spec: requestBody.spec ?? networkMapData1.spec,
          }),
          contentType: 'application/json',
          status: 201,
        });
      } else {
        await route.continue();
      }
    },
  );

  // NetworkMap GET/PATCH requests
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/(?:openshift-mtv|konveyor-forklift)\/networkmaps\/[^/?]*$/u,
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
          body: JSON.stringify({
            ...networkMapData1,
            metadata: {
              ...networkMapData1.metadata,
              creationTimestamp: new Date().toISOString(),
              name,
              namespace,
              uid: `test-networkmap-uid-${name}`,
            },
          }),
          contentType: 'application/json',
          status: 200,
        });
      } else if (route.request().method() === 'PATCH') {
        const { name, namespace } = parseUrl(route.request().url());

        await route.fulfill({
          body: JSON.stringify({
            ...networkMapData1,
            metadata: {
              ...networkMapData1.metadata,
              creationTimestamp: new Date().toISOString(),
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
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );

  await page.route(API_ENDPOINTS.networkMaps, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [networkMapData1, networkMapData2],
      }),
      contentType: 'application/json',
      status: 200,
    });
  });
};
