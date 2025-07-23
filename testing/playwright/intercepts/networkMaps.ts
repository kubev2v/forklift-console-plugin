import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

export const setupNetworkMapsIntercepts = async (page: Page) => {
  await page.route(API_ENDPOINTS.networkMaps, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [
          {
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
          },
        ],
      }),
    });
  });
};
